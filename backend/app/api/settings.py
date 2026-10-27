from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import (
    settings,
    set_runtime_gemini_key,
    get_effective_gemini_key,
    get_effective_gemini_model,
    set_runtime_gemini_model
)
from app.core.database import get_db
from app.core.auth import get_optional_current_user
from app.models.db_models import User, Document, DocumentChunk
from app.schemas.api_schemas import (
    SettingsStatusResponse, UpdateApiKeyRequest, UpdateModelRequest, GenericMessageResponse
)
from app.services.ai_provider import ai_provider

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/status", response_model=SettingsStatusResponse)
def get_settings_status(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if current_user:
        doc_count = db.query(Document).filter(
            (Document.user_id == current_user.id) | (Document.user_id.is_(None))
        ).count()
        chunk_count = db.query(DocumentChunk).join(Document).filter(
            (Document.user_id == current_user.id) | (Document.user_id.is_(None))
        ).count()
        user_key = current_user.gemini_api_key.strip() if current_user.gemini_api_key else None
        effective_key = user_key or get_effective_gemini_key()
        effective_model = (current_user.gemini_model.strip() if current_user.gemini_model else None) or get_effective_gemini_model()
    else:
        doc_count = db.query(Document).count()
        chunk_count = db.query(DocumentChunk).count()
        effective_key = get_effective_gemini_key()
        effective_model = get_effective_gemini_model()

    is_configured = ai_provider.is_configured(api_key=effective_key)

    if settings.is_postgres():
        v_store = "Supabase pgvector (Cloud Cosine Distance)"
        db_type = "Supabase PostgreSQL (Cloud Database)"
        emb_prov = "Google Gemini text-embedding-004 (768-dim)" if is_configured else "Dense Semantic Vector Engine (Deterministic 768-dim)"
    else:
        v_store = "ChromaDB Persistent Index (Local Vector DB)"
        db_type = "SQLite Relational Database (Local Persistent)"
        emb_prov = "Dense Semantic Vector Engine (Multi-Stage)"

    return SettingsStatusResponse(
        gemini_configured=is_configured,
        gemini_model=effective_model,
        embedding_provider=emb_prov,
        vector_store=v_store,
        documents_count=doc_count,
        chunks_count=chunk_count,
        database_type=db_type
    )

@router.post("/api-key", response_model=GenericMessageResponse)
def update_api_key(
    request: UpdateApiKeyRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    clean_key = request.api_key.strip()

    # If user is authenticated, save directly to user's database record
    if current_user:
        current_user.gemini_api_key = clean_key
        db.commit()
        db.refresh(current_user)
    else:
        # If unauthenticated, persist to .env for local single-user mode
        set_runtime_gemini_key(clean_key)
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
                    new_lines.append(f"GEMINI_API_KEY={clean_key}\n")
                    has_key = True
                else:
                    new_lines.append(line)
            if not has_key:
                new_lines.append(f"GEMINI_API_KEY={clean_key}\n")
            with open(env_path, "w", encoding="utf-8") as f:
                f.writelines(new_lines)
        except Exception:
            pass

    is_valid = ai_provider.is_configured(api_key=clean_key)
    if is_valid:
        return GenericMessageResponse(
            message="Gemini API Key saved to your user account and activated. Live GenAI generation is now active.",
            success=True
        )
    return GenericMessageResponse(
        message="API Key saved to your user account, but validation could not verify SDK access.",
        success=False
    )

@router.post("/model", response_model=GenericMessageResponse)
def update_model(
    request: UpdateModelRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    clean_model = request.model.strip()

    # If user is authenticated, save directly to user's database record
    if current_user:
        current_user.gemini_model = clean_model
        db.commit()
        db.refresh(current_user)

    set_runtime_gemini_model(clean_model)
    return GenericMessageResponse(
        message=f"Model updated to '{clean_model}'.",
        success=True
    )
