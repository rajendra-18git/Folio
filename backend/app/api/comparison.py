import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_optional_current_user
from app.models.db_models import DocumentComparison, Document, User
from app.schemas.api_schemas import (
    CompareRequest, CompareResponse, ComparisonReport
)
from app.services.comparison_agent import comparison_agent

router = APIRouter(prefix="/documents", tags=["Comparison"])

@router.post("/compare", response_model=CompareResponse)
def compare_documents(
    request: CompareRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # Verify user ownership of the documents
    if current_user and request.document_ids:
        docs = db.query(Document).filter(
            Document.id.in_(request.document_ids),
            (Document.user_id == current_user.id) | (Document.user_id.is_(None))
        ).all()
        if len(docs) != len(request.document_ids):
            raise HTTPException(status_code=403, detail="Unauthorized: one or more documents do not belong to your account.")

    try:
        record = comparison_agent.compare_documents(
            db=db,
            document_ids=request.document_ids,
            topic_focus=request.topic_focus
        )
        if current_user:
            record.user_id = current_user.id
            db.commit()

        report_dict = json.loads(record.report_content)
        return CompareResponse(
            id=record.id,
            document_ids=json.loads(record.document_ids),
            report=ComparisonReport(**report_dict),
            created_at=record.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/compare/history", response_model=List[CompareResponse])
def get_comparison_history(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DocumentComparison)
    if current_user:
        query = query.filter(DocumentComparison.user_id == current_user.id)
    else:
        query = query.filter(DocumentComparison.user_id.is_(None))
    records = query.order_by(DocumentComparison.created_at.desc()).all()
    result = []
    for r in records:
        try:
            report_dict = json.loads(r.report_content)
            result.append(CompareResponse(
                id=r.id,
                document_ids=json.loads(r.document_ids),
                report=ComparisonReport(**report_dict),
                created_at=r.created_at
            ))
        except Exception:
            continue
    return result

@router.get("/compare/{comparison_id}", response_model=CompareResponse)
def get_comparison(
    comparison_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DocumentComparison).filter(DocumentComparison.id == comparison_id)
    if current_user:
        query = query.filter((DocumentComparison.user_id == current_user.id) | (DocumentComparison.user_id.is_(None)))
    record = query.first()
    if not record:
        raise HTTPException(status_code=404, detail="Comparison record not found.")
    report_dict = json.loads(record.report_content)
    return CompareResponse(
        id=record.id,
        document_ids=json.loads(record.document_ids),
        report=ComparisonReport(**report_dict),
        created_at=record.created_at
    )
