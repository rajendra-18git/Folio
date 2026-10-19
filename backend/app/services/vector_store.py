import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any, Optional
from app.core.config import settings

class VectorStoreService:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=str(settings.CHROMA_DIR),
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )

    def add_chunks(self, document_id: str, chunks: List[Dict[str, Any]]) -> int:
        """
        Adds chunk texts with metadata to the Chroma vector collection.
        """
        if not chunks:
            return 0

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

        # Chroma's default embedding function generates embeddings automatically
        self.collection.add(
            ids=ids,
            documents=texts,
            metadatas=metadatas
        )
        return len(ids)

    def search(
        self,
        query: str,
        document_ids: Optional[List[str]] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top_k similar chunks. Optionally filters by document_ids.
        """
        if not query.strip():
            return []

        where_clause = None
        if document_ids:
            if len(document_ids) == 1:
                where_clause = {"document_id": document_ids[0]}
            else:
                where_clause = {"document_id": {"$in": document_ids}}

        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                where=where_clause
            )
        except Exception:
            # If collection is empty or filter yields no matches
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
                score = max(0.0, 1.0 - dist)  # Convert cosine distance to similarity score
                retrieved.append({
                    "id": ids[i],
                    "content": docs[i],
                    "document_id": meta.get("document_id", ""),
                    "page_number": meta.get("page_number", 1),
                    "chunk_index": meta.get("chunk_index", 0),
                    "score": round(score, 4)
                })

        return retrieved

    def delete_document_chunks(self, document_id: str) -> None:
        """
        Deletes all chunks belonging to a document from ChromaDB.
        """
        try:
            self.collection.delete(where={"document_id": document_id})
        except Exception:
            pass

vector_store = VectorStoreService()
