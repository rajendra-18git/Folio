from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.api_schemas import (
    MultimodalAnalysisRequest, MultimodalAnalysisResponse
)
from app.services.multimodal_service import multimodal_service

router = APIRouter(prefix="/multimodal", tags=["Multimodal"])

@router.post("/analyze", response_model=MultimodalAnalysisResponse)
def analyze_page(request: MultimodalAnalysisRequest, db: Session = Depends(get_db)):
    try:
        return multimodal_service.analyze_page(
            db=db,
            document_id=request.document_id,
            page_number=request.page_number,
            analysis_type=request.analysis_type,
            question=request.question
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
