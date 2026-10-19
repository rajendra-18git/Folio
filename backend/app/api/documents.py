import os
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.db_models import Document, DocumentChunk
from app.schemas.api_schemas import (
    DocumentResponse, DocumentDetailResponse, GenericMessageResponse
)
from app.services.pdf_service import PDFService
from app.services.vector_store import vector_store

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Validate file extension and MIME type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # 2. Read content and validate size
    content = await file.read()
    file_size = len(content)
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )

    # 3. Validate PDF magic number (%PDF-)
    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format: File header is not a valid PDF document."
        )

    # 4. Create document record in database
    clean_filename = Path(file.filename).name.replace(" ", "_")
    doc_record = Document(
        original_filename=file.filename,
        filename=clean_filename,
        file_path="",
        file_size_bytes=file_size,
        status="processing"
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    # 5. Save file securely to upload directory
    dest_path = settings.UPLOAD_DIR / f"{doc_record.id}_{clean_filename}"
    try:
        with open(dest_path, "wb") as f:
            f.write(content)
        doc_record.file_path = str(dest_path)
        db.commit()
    except Exception as e:
        doc_record.status = "error"
        doc_record.error_message = f"Failed to save file: {str(e)}"
        db.commit()
        raise HTTPException(status_code=500, detail="Could not store file.")

    # 6. Extract text and chunk
    try:
        pages, is_scanned = PDFService.extract_document_pages(dest_path)
        chunks_data = PDFService.chunk_pages(
            pages,
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )

        doc_record.page_count = len(pages)
        doc_record.chunk_count = len(chunks_data)

        # Store chunks in SQL
        db_chunks = []
        for c in chunks_data:
            chunk_obj = DocumentChunk(
                document_id=doc_record.id,
                chunk_index=c["chunk_index"],
                page_number=c["page_number"],
                content=c["content"],
                token_count=c["token_count"]
            )
            db_chunks.append(chunk_obj)
        db.bulk_save_objects(db_chunks)

        # Index chunks in ChromaDB vector store
        vector_store.add_chunks(doc_record.id, chunks_data)

        doc_record.status = "ready"
        if is_scanned:
            doc_record.error_message = "Document appears to be scanned or image-based. Text extracted via visual inspection/OCR."
        db.commit()
        db.refresh(doc_record)

    except Exception as e:
        doc_record.status = "error"
        doc_record.error_message = f"Ingestion error: {str(e)}"
        db.commit()
        db.refresh(doc_record)
        raise HTTPException(status_code=422, detail=f"Failed to process PDF: {str(e)}")

    return doc_record

@router.get("", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.created_at.desc()).all()

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.delete("/{document_id}", response_model=GenericMessageResponse)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # 1. Delete vector store chunks from ChromaDB
    try:
        vector_store.delete_document_chunks(document_id)
    except Exception:
        pass

    # 2. Delete file from disk
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    # 3. Explicitly delete child relations to prevent any foreign key constraint issues
    try:
        db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete(synchronize_session=False)
        from app.models.db_models import StudyGeneration
        db.query(StudyGeneration).filter(StudyGeneration.document_id == document_id).delete(synchronize_session=False)
    except Exception:
        pass

    # 4. Delete document from SQL database
    db.delete(doc)
    db.commit()
    return GenericMessageResponse(message=f"Document '{doc.original_filename}' deleted successfully.", success=True)

@router.get("/{document_id}/pages/{page_number}/image")
def get_page_image(document_id: str, page_number: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    file_path = Path(doc.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File missing on disk.")

    try:
        img_bytes = PDFService.render_page_to_png(file_path, page_number)
        return Response(content=img_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{document_id}/download")
def download_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type="application/pdf"
    )
