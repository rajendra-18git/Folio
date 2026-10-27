import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class EmailVerificationOTP(Base):
    __tablename__ = "email_verification_otps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), index=True, nullable=False)
    otp_code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False, default="login")  # "login", "register"
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size_bytes = Column(Integer, nullable=False, default=0)
    page_count = Column(Integer, nullable=False, default=0)
    chunk_count = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="processing")  # processing, ready, error
    error_message = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    study_generations = relationship("StudyGeneration", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    embedding = Column(Vector(768), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False, default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    citations = Column(Text, nullable=True)  # JSON string of citations
    is_demo_mode = Column(Boolean, default=False)
    latency_ms = Column(Float, default=0.0)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

class StudyGeneration(Base):
    __tablename__ = "study_generations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    study_type = Column(String(50), nullable=False)  # summary, two_mark, five_mark, ten_mark, flashcards, mcqs, practice_test
    topic = Column(String(255), nullable=True)
    generated_content = Column(Text, nullable=False)  # JSON string of structured output
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="study_generations")

class DocumentComparison(Base):
    __tablename__ = "document_comparisons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    document_ids = Column(Text, nullable=False)  # JSON string list of doc IDs
    document_titles = Column(Text, nullable=False)  # JSON string list of doc titles
    topic_focus = Column(String(255), nullable=True)
    report_content = Column(Text, nullable=False)  # JSON string comparison result
    created_at = Column(DateTime, default=datetime.utcnow)

class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    test_cases_count = Column(Integer, default=0)
    citation_validity_score = Column(Float, default=0.0)
    page_validity_score = Column(Float, default=0.0)
    retrieval_relevance_score = Column(Float, default=0.0)
    answer_completeness_score = Column(Float, default=0.0)
    avg_latency_ms = Column(Float, default=0.0)
    total_tokens = Column(Integer, default=0)
    estimated_cost_usd = Column(Float, default=0.0)
    results_details = Column(Text, nullable=False)  # JSON string breakdown
    created_at = Column(DateTime, default=datetime.utcnow)

class EvaluationTestCase(Base):
    __tablename__ = "evaluation_test_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question = Column(Text, nullable=False)
    expected_doc_id = Column(String(36), nullable=True)
    expected_doc_title = Column(String(255), nullable=True)
    expected_pages = Column(Text, nullable=True)  # JSON array of ints
    expected_keywords = Column(Text, nullable=True)  # JSON array of keywords
    created_at = Column(DateTime, default=datetime.utcnow)
