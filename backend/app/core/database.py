from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

db_url = settings.get_effective_database_url()

if settings.is_postgres():
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=300
    )
else:
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import text

def init_db():
    import app.models.db_models  # noqa: F401
    
    # If using Supabase / PostgreSQL, ensure pgvector extension is enabled
    if settings.is_postgres():
        with engine.connect() as conn:
            try:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                conn.commit()
            except Exception as e:
                print(f"[Supabase] Note on vector extension initialization: {e}")

    Base.metadata.create_all(bind=engine)
    
    def safe_execute(sql: str):
        try:
            with engine.begin() as conn:
                conn.execute(text(sql))
        except Exception:
            pass

    if settings.is_postgres():
        safe_execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0")
        safe_execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE")
        safe_execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_api_key VARCHAR(512)")
        safe_execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_model VARCHAR(128)")
        safe_execute("ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding VECTOR(768)")
        safe_execute("ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id VARCHAR(36)")
        safe_execute("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id VARCHAR(36)")
        safe_execute("ALTER TABLE study_generations ADD COLUMN IF NOT EXISTS user_id VARCHAR(36)")
        safe_execute("ALTER TABLE document_comparisons ADD COLUMN IF NOT EXISTS user_id VARCHAR(36)")
        safe_execute("CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id)")
        safe_execute("CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations (user_id)")
    else:
        safe_execute("ALTER TABLE messages ADD COLUMN tokens_used INTEGER DEFAULT 0")
        safe_execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0")
        safe_execute("ALTER TABLE users ADD COLUMN gemini_api_key VARCHAR(512)")
        safe_execute("ALTER TABLE users ADD COLUMN gemini_model VARCHAR(128)")
        safe_execute("ALTER TABLE document_chunks ADD COLUMN embedding VECTOR(768)")
        safe_execute("ALTER TABLE documents ADD COLUMN user_id VARCHAR(36)")
        safe_execute("ALTER TABLE conversations ADD COLUMN user_id VARCHAR(36)")
        safe_execute("ALTER TABLE study_generations ADD COLUMN user_id VARCHAR(36)")
        safe_execute("ALTER TABLE document_comparisons ADD COLUMN user_id VARCHAR(36)")
