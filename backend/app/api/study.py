import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_optional_current_user
from app.models.db_models import StudyGeneration, Document, User
from app.schemas.api_schemas import (
    StudyGenerateRequest, StudyGenerateResponse, StudyContent
)
from app.services.study_service import study_service

router = APIRouter(prefix="/study", tags=["Study"])

@router.post("/generate", response_model=StudyGenerateResponse)
def generate_study_material(
    request: StudyGenerateRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # Verify user ownership of the document
    if current_user:
        doc = db.query(Document).filter(
            Document.id == request.document_id,
            (Document.user_id == current_user.id) | (Document.user_id.is_(None))
        ).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found or unauthorized.")

    try:
        gen = study_service.generate_study_material(
            db=db,
            document_id=request.document_id,
            study_type=request.study_type,
            topic=request.topic
        )
        content_dict = json.loads(gen.generated_content)
        return StudyGenerateResponse(
            id=gen.id,
            document_id=gen.document_id,
            study_type=gen.study_type,
            topic=gen.topic,
            data=StudyContent(**content_dict),
            created_at=gen.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history/{document_id}", response_model=List[StudyGenerateResponse])
def get_study_history(
    document_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if current_user:
        doc = db.query(Document).filter(
            Document.id == document_id,
            (Document.user_id == current_user.id) | (Document.user_id.is_(None))
        ).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found or unauthorized.")

    gens = db.query(StudyGeneration).filter(
        StudyGeneration.document_id == document_id
    ).order_by(StudyGeneration.created_at.desc()).all()

    result = []
    for g in gens:
        try:
            content_dict = json.loads(g.generated_content)
            result.append(StudyGenerateResponse(
                id=g.id,
                document_id=g.document_id,
                study_type=g.study_type,
                topic=g.topic,
                data=StudyContent(**content_dict),
                created_at=g.created_at
            ))
        except Exception:
            continue
    return result

@router.get("/{generation_id}", response_model=StudyGenerateResponse)
def get_single_generation(
    generation_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    gen = db.query(StudyGeneration).filter(StudyGeneration.id == generation_id).first()
    if not gen:
        raise HTTPException(status_code=404, detail="Study generation not found.")
    content_dict = json.loads(gen.generated_content)
    return StudyGenerateResponse(
        id=gen.id,
        document_id=gen.document_id,
        study_type=gen.study_type,
        topic=gen.topic,
        data=StudyContent(**content_dict),
        created_at=gen.created_at
    )
