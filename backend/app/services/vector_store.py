import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.db_models import DocumentChunk
from app.services.ai_provider import ai_provider

class VectorStoreService:
    def __init__(self):
        self._chroma_client = None
        self._chroma_collection = None

    def _get_chroma_collection(self):
        if self._chroma_collection is None:
            self._chroma_client = chromadb.PersistentClient(
                path=str(settings.CHROMA_DIR),
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            self._chroma_collection = self._chroma_client.get_or_create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )
        return self._chroma_collection

    def is_pgvector(self) -> bool:
        """Returns True if the backend is configured to use Supabase / PostgreSQL pgvector."""
        return settings.is_postgres()

    def add_chunks(
        self,
        document_id: str,
        chunks: List[Dict[str, Any]],
        db: Optional[Session] = None
    ) -> int:
        """
        Adds chunk texts with metadata to the vector store.
        Uses Supabase pgvector if connected to PostgreSQL; otherwise uses ChromaDB.
        """
        if not chunks:
            return 0

        # --- Supabase / PostgreSQL pgvector flow ---
        if self.is_pgvector():
            texts = [c["content"] for c in chunks]
            embeddings = ai_provider.get_embeddings(texts)
            
            close_session = False
            session = db
            if session is None:
                session = SessionLocal()
                close_session = True

            try:
                # Update embeddings on stored DocumentChunk rows
                for c, emb in zip(chunks, embeddings):
                    chunk_row = session.query(DocumentChunk).filter(
                        DocumentChunk.document_id == document_id,
                        DocumentChunk.chunk_index == c["chunk_index"]
                    ).first()
                    if chunk_row:
                        chunk_row.embedding = emb
                session.commit()
                return len(chunks)
            except Exception as e:
                session.rollback()
                print(f"[Supabase pgvector] Error saving embeddings: {e}")
                return 0
            finally:
                if close_session:
                    session.close()

        # --- Local ChromaDB fallback flow ---
        collection = self._get_chroma_collection()
        ids = [f"{document_id}_chunk_{c['chunk_index']}" for c in chunks]
        texts = [c["content"] for c in chunks]
        metadatas = [
            {
                "document_id": document_id,
                "page_number": int(c["page_number"]),
                "chunk_index": int(c["chunk_index"])
            }
            for c in chunks
        ]

        collection.add(
            ids=ids,
            documents=texts,
            metadatas=metadatas
        )
        return len(ids)

    def search(
        self,
        query: str,
        document_ids: Optional[List[str]] = None,
        top_k: int = 5,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top_k similar chunks.
        Queries Supabase pgvector via cosine distance if on PostgreSQL, or ChromaDB if on SQLite.
        """
        if not query.strip():
            return []

        # --- Supabase / PostgreSQL pgvector search ---
        if self.is_pgvector():
            close_session = False
            session = db
            if session is None:
                session = SessionLocal()
                close_session = True

            try:
                query_emb = ai_provider.get_embedding(query)
                dist_expr = DocumentChunk.embedding.cosine_distance(query_emb).label("distance")
                
                stmt = session.query(DocumentChunk, dist_expr).filter(
                    DocumentChunk.embedding.isnot(None)
                )

                if document_ids:
                    stmt = stmt.filter(DocumentChunk.document_id.in_(document_ids))

                results = stmt.order_by("distance").limit(top_k).all()

                retrieved: List[Dict[str, Any]] = []
                for chunk, dist in results:
                    dist_val = float(dist) if dist is not None else 1.0
                    score = max(0.0, 1.0 - dist_val)
                    retrieved.append({
                        "id": f"{chunk.document_id}_chunk_{chunk.chunk_index}",
                        "content": chunk.content,
                        "document_id": chunk.document_id,
                        "page_number": chunk.page_number,
                        "chunk_index": chunk.chunk_index,
                        "score": round(score, 4)
                    })
                return retrieved
            except Exception as e:
                print(f"[Supabase pgvector] Error during search: {e}")
                return []
            finally:
                if close_session:
                    session.close()

        # --- Local ChromaDB search ---
        collection = self._get_chroma_collection()
        where_clause = None
        if document_ids:
            if len(document_ids) == 1:
                where_clause = {"document_id": document_ids[0]}
            else:
                where_clause = {"document_id": {"$in": document_ids}}

        try:
            results = collection.query(
                query_texts=[query],
                n_results=top_k,
                where=where_clause
            )
        except Exception:
            return []

        retrieved: List[Dict[str, Any]] = []
        if results and results.get("documents") and results["documents"][0]:
            docs = results["documents"][0]
            metas = results["metadatas"][0] if results.get("metadatas") else []
            distances = results["distances"][0] if results.get("distances") else []
            ids = results["ids"][0] if results.get("ids") else []

            for i in range(len(docs)):
                meta = metas[i] if i < len(metas) else {}
                dist = distances[i] if i < len(distances) else 1.0
                score = max(0.0, 1.0 - dist)
                retrieved.append({
                    "id": ids[i],
                    "content": docs[i],
                    "document_id": meta.get("document_id", ""),
                    "page_number": meta.get("page_number", 1),
                    "chunk_index": meta.get("chunk_index", 0),
                    "score": round(score, 4)
                })

        return retrieved

    def delete_document_chunks(self, document_id: str, db: Optional[Session] = None) -> None:
        """
        Deletes all chunks belonging to a document.
        """
        if self.is_pgvector():
            close_session = False
            session = db
            if session is None:
                session = SessionLocal()
                close_session = True
            try:
                session.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
                session.commit()
            except Exception:
                session.rollback()
            finally:
                if close_session:
                    session.close()
            return

        try:
            collection = self._get_chroma_collection()
            collection.delete(where={"document_id": document_id})
        except Exception:
            pass

vector_store = VectorStoreService()
