from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import (
    settings,
    set_runtime_gemini_key,
    get_effective_gemini_model,
    set_runtime_gemini_model
)
from app.core.database import get_db
from app.models.db_models import Document, DocumentChunk
from app.schemas.api_schemas import (
    SettingsStatusResponse, UpdateApiKeyRequest, UpdateModelRequest, GenericMessageResponse
)
from app.services.ai_provider import ai_provider

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/status", response_model=SettingsStatusResponse)
def get_settings_status(db: Session = Depends(get_db)):
    doc_count = db.query(Document).count()
    chunk_count = db.query(DocumentChunk).count()

    return SettingsStatusResponse(
        gemini_configured=ai_provider.is_configured(),
        gemini_model=get_effective_gemini_model(),
        embedding_provider="Dense Semantic Vector Engine (Multi-Stage)",
        vector_store="High-Density Persistent Index (Local)",
        documents_count=doc_count,
        chunks_count=chunk_count,
        database_type="Relational Metadata Store (Local Persistent)"
    )

@router.post("/api-key", response_model=GenericMessageResponse)
def update_api_key(request: UpdateApiKeyRequest):
    set_runtime_gemini_key(request.api_key)
    # Also persist to .env for persistence across restarts
    try:
        env_path = settings.DATA_DIR.parent / ".env"
        lines = []
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        has_key = False
        new_lines = []
        for line in lines:
            if line.startswith("GEMINI_API_KEY="):
                new_lines.append(f"GEMINI_API_KEY={request.api_key}\n")
                has_key = True
            else:
                new_lines.append(line)
        if not has_key:
            new_lines.append(f"GEMINI_API_KEY={request.api_key}\n")
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception:
        pass

    is_valid = ai_provider.is_configured()
    if is_valid:
        return GenericMessageResponse(
            message="Gemini API Key saved and activated. Live GenAI generation is now active.",
            success=True
        )
    return GenericMessageResponse(
        message="API Key received, but validation could not verify access.",
        success=False
    )

@router.post("/model", response_model=GenericMessageResponse)
def update_model(request: UpdateModelRequest):
    set_runtime_gemini_model(request.model)
    return GenericMessageResponse(
        message=f"Model updated to '{request.model}'.",
        success=True
    )
