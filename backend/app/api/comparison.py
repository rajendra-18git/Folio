import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.db_models import DocumentComparison
from app.schemas.api_schemas import (
    CompareRequest, CompareResponse, ComparisonReport
)
from app.services.comparison_agent import comparison_agent

router = APIRouter(prefix="/documents", tags=["Comparison"])

@router.post("/compare", response_model=CompareResponse)
def compare_documents(request: CompareRequest, db: Session = Depends(get_db)):
    try:
        record = comparison_agent.compare_documents(
            db=db,
            document_ids=request.document_ids,
            topic_focus=request.topic_focus
        )
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
def get_comparison_history(db: Session = Depends(get_db)):
    records = db.query(DocumentComparison).order_by(DocumentComparison.created_at.desc()).all()
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
def get_comparison(comparison_id: str, db: Session = Depends(get_db)):
    record = db.query(DocumentComparison).filter(DocumentComparison.id == comparison_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Comparison record not found.")
    report_dict = json.loads(record.report_content)
    return CompareResponse(
        id=record.id,
        document_ids=json.loads(record.document_ids),
        report=ComparisonReport(**report_dict),
        created_at=record.created_at
    )
