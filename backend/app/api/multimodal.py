from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.db_models import User, Document
from app.core.auth import get_optional_current_user
from app.schemas.api_schemas import (
    MultimodalAnalysisRequest, MultimodalAnalysisResponse
)
from app.services.multimodal_service import multimodal_service

router = APIRouter(prefix="/multimodal", tags=["Multimodal"])

@router.post("/analyze", response_model=MultimodalAnalysisResponse)
def analyze_page(
    request: MultimodalAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    try:
        if current_user:
            doc = db.query(Document).filter(Document.id == request.document_id, Document.user_id == current_user.id).first()
            if not doc:
                raise HTTPException(status_code=404, detail="Document not found or access denied.")

        return multimodal_service.analyze_page(
            db=db,
            document_id=request.document_id,
            page_number=request.page_number,
            analysis_type=request.analysis_type,
            question=request.question
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
