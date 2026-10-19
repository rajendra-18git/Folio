import os
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "DocuMind AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Storage paths
    DATA_DIR: Path = BASE_DIR / "data"
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    CHROMA_DIR: Path = BASE_DIR / "data" / "chroma"
    DATABASE_URL: str = f"sqlite:///{(BASE_DIR / 'data' / 'documind.db').as_posix()}"
    
    # Gemini Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-flash-latest"

    # Authentication & JWT
    JWT_SECRET_KEY: str = "folio_jwt_super_secret_key_2026_grounded_rag_enterprise_security"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Real Email & SMTP Configuration for OTP
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    SMTP_FROM_NAME: str = "Folio AI Security"
    SMTP_TLS: bool = True
    OTP_EXPIRE_MINUTES: int = 10
    
    # Retrieval and Embedding
    CHROMA_COLLECTION_NAME: str = "documind_chunks"
    TOP_K_RETRIEVAL: int = 5
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 150
    MAX_FILE_SIZE_MB: int = 25
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.CHROMA_DIR.mkdir(parents=True, exist_ok=True)

# Runtime key & model storage (allows user to enter API key and model via settings page or env)
_runtime_api_key: Optional[str] = None
_runtime_model: Optional[str] = None

def get_effective_gemini_key() -> Optional[str]:
    global _runtime_api_key
    if _runtime_api_key:
        return _runtime_api_key
    return settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")

def set_runtime_gemini_key(key: Optional[str]) -> None:
    global _runtime_api_key
    _runtime_api_key = key.strip() if key else None

def get_effective_gemini_model() -> str:
    global _runtime_model
    if _runtime_model:
        return _runtime_model
    return settings.GEMINI_MODEL or os.environ.get("GEMINI_MODEL", "gemini-flash-latest")

def set_runtime_gemini_model(model: Optional[str]) -> None:
    global _runtime_model
    _runtime_model = model.strip() if model else None

# Runtime SMTP storage
_runtime_smtp_host: Optional[str] = None
_runtime_smtp_port: Optional[int] = None
_runtime_smtp_user: Optional[str] = None
_runtime_smtp_password: Optional[str] = None
_runtime_smtp_from_email: Optional[str] = None

def get_effective_smtp_config() -> dict:
    global _runtime_smtp_host, _runtime_smtp_port, _runtime_smtp_user, _runtime_smtp_password, _runtime_smtp_from_email
    host = _runtime_smtp_host or settings.SMTP_HOST or os.environ.get("SMTP_HOST")
    port = _runtime_smtp_port or settings.SMTP_PORT or int(os.environ.get("SMTP_PORT", 587))
    user = _runtime_smtp_user or settings.SMTP_USER or os.environ.get("SMTP_USER")
    password = _runtime_smtp_password or settings.SMTP_PASSWORD or os.environ.get("SMTP_PASSWORD")
    from_email = _runtime_smtp_from_email or settings.SMTP_FROM_EMAIL or os.environ.get("SMTP_FROM_EMAIL") or user or "noreply@folio.ai"
    from_name = settings.SMTP_FROM_NAME

    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "from_email": from_email,
        "from_name": from_name,
        "tls": settings.SMTP_TLS,
        "is_configured": bool(host and user and password),
    }

def set_runtime_smtp_config(
    host: Optional[str] = None,
    port: Optional[int] = None,
    user: Optional[str] = None,
    password: Optional[str] = None,
    from_email: Optional[str] = None,
) -> None:
    global _runtime_smtp_host, _runtime_smtp_port, _runtime_smtp_user, _runtime_smtp_password, _runtime_smtp_from_email
    if host is not None:
        _runtime_smtp_host = host.strip() if host else None
    if port is not None:
        _runtime_smtp_port = port
    if user is not None:
        _runtime_smtp_user = user.strip() if user else None
    if password is not None:
        _runtime_smtp_password = password.strip() if password else None
    if from_email is not None:
        _runtime_smtp_from_email = from_email.strip() if from_email else None

