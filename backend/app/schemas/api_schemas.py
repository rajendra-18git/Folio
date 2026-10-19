from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

# Document Schemas
class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_size_bytes: int
    page_count: int
    chunk_count: int
    status: str
    error_message: Optional[str] = None
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentChunkResponse(BaseModel):
    id: str
    chunk_index: int
    page_number: int
    content: str
    token_count: int

    model_config = ConfigDict(from_attributes=True)

class DocumentDetailResponse(DocumentResponse):
    chunks: List[DocumentChunkResponse] = []

# Citation Schema
class Citation(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    chunk_index: Optional[int] = None
    excerpt: str
    score: Optional[float] = None

# Chat Schemas
class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    citations: List[Citation] = []
    is_demo_mode: bool = False
    latency_ms: float = 0.0
    tokens_used: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    question: str = Field(..., min_length=1)
    document_ids: List[str] = Field(default_factory=list)

class ChatResponse(BaseModel):
    conversation_id: str
    message: MessageResponse

# Study Assistant Schemas
class StudyGenerateRequest(BaseModel):
    document_id: str
    study_type: str = Field(..., description="summary, two_mark, five_mark, ten_mark, flashcards, mcqs, practice_test")
    topic: Optional[str] = None

class FlashcardItem(BaseModel):
    question: str
    answer: str
    difficulty: str  # Easy, Medium, Hard
    page_number: Optional[int] = None

class MCQItem(BaseModel):
    question: str
    options: List[str]
    correct_option: str
    explanation: str
    page_number: Optional[int] = None

class ExamAnswerItem(BaseModel):
    question: str
    marks: int
    key_points: List[str]
    detailed_answer: str
    page_references: List[int] = []

class PracticeTestItem(BaseModel):
    title: str
    duration_minutes: int
    total_marks: int
    sections: List[Dict[str, Any]]

class StudyContent(BaseModel):
    study_type: str
    topic: Optional[str] = None
    document_name: str
    summary_markdown: Optional[str] = None
    key_takeaways: Optional[List[str]] = None
    exam_answers: Optional[List[ExamAnswerItem]] = None
    flashcards: Optional[List[FlashcardItem]] = None
    mcqs: Optional[List[MCQItem]] = None
    practice_test: Optional[PracticeTestItem] = None
    citations: List[Citation] = []
    is_demo_mode: bool = False
    tokens_used: int = 0
    latency_ms: float = 0.0

class StudyGenerateResponse(BaseModel):
    id: str
    document_id: str
    study_type: str
    topic: Optional[str] = None
    data: StudyContent
    created_at: datetime

# Comparison Schemas
class CompareRequest(BaseModel):
    document_ids: List[str] = Field(..., min_length=2)
    topic_focus: Optional[str] = None

class ComparisonClaim(BaseModel):
    topic: str
    document_a_view: str
    document_b_view: str
    status: str  # Agreement, Contrast, Contradiction, Unique to Doc A, Unique to Doc B
    citations: List[Citation] = []

class ComparisonReport(BaseModel):
    documents: List[Dict[str, str]]
    executive_summary: str
    key_similarities: List[str]
    key_differences: List[str]
    claims_matrix: List[ComparisonClaim]
    contradictions: List[str]
    evidence_gaps: List[str]
    synthesis_conclusion: str
    citations: List[Citation] = []
    is_demo_mode: bool = False
    tokens_used: int = 0
    latency_ms: float = 0.0

class CompareResponse(BaseModel):
    id: str
    document_ids: List[str]
    report: ComparisonReport
    created_at: datetime

# Multimodal Schemas
class MultimodalAnalysisRequest(BaseModel):
    document_id: str
    page_number: int = Field(..., ge=1)
    analysis_type: str = Field(default="general", description="general, diagram, table, chart, visual_qa")
    question: Optional[str] = None

class MultimodalAnalysisResponse(BaseModel):
    document_id: str
    page_number: int
    analysis_type: str
    extracted_insights: str
    diagram_description: Optional[str] = None
    table_data_markdown: Optional[str] = None
    chart_interpretation: Optional[str] = None
    answer: Optional[str] = None
    image_preview_url: str
    is_configured: bool
    is_demo_mode: bool
    tokens_used: int = 0
    latency_ms: float = 0.0

# Evaluation Schemas
class TestCaseCreateRequest(BaseModel):
    question: str
    expected_doc_id: Optional[str] = None
    expected_doc_title: Optional[str] = None
    expected_pages: List[int] = []
    expected_keywords: List[str] = []

class TestCaseResponse(BaseModel):
    id: str
    question: str
    expected_doc_id: Optional[str] = None
    expected_doc_title: Optional[str] = None
    expected_pages: List[int] = []
    expected_keywords: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EvaluationRunRequest(BaseModel):
    name: Optional[str] = "Benchmark Run"
    test_case_ids: Optional[List[str]] = None

class EvalResultDetail(BaseModel):
    test_case_id: str
    question: str
    generated_answer: str
    citations_count: int
    citation_validity: float
    page_validity: float
    relevance_score: float
    completeness_score: float
    latency_ms: float
    tokens_used: int
    cost_usd: float

class EvaluationRunResponse(BaseModel):
    id: str
    name: str
    test_cases_count: int
    citation_validity_score: float
    page_validity_score: float
    retrieval_relevance_score: float
    answer_completeness_score: float
    avg_latency_ms: float
    total_tokens: int
    estimated_cost_usd: float
    details: List[EvalResultDetail] = []
    created_at: datetime

# Settings Schemas
class SettingsStatusResponse(BaseModel):
    gemini_configured: bool
    gemini_model: str
    embedding_provider: str
    vector_store: str
    documents_count: int
    chunks_count: int
    database_type: str

class UpdateApiKeyRequest(BaseModel):
    api_key: str = Field(..., min_length=1)

class UpdateModelRequest(BaseModel):
    model: str = Field(..., min_length=1)

class GenericMessageResponse(BaseModel):
    message: str
    success: bool = True

# Authentication Schemas
class UserRegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Real Email OTP Verification Schemas
class SendOtpRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    purpose: str = Field(default="login")  # "login", "register"

class SendOtpResponse(BaseModel):
    message: str
    email: str
    expires_in_seconds: int = 600
    email_sent: bool
    debug_hint: Optional[str] = None

class VerifyOtpLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    otp_code: str = Field(..., min_length=4, max_length=10)

class RegisterWithOtpRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: Optional[str] = None
    otp_code: str = Field(..., min_length=4, max_length=10)

class UpdateSmtpRequest(BaseModel):
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None

class SmtpStatusResponse(BaseModel):
    is_configured: bool
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_from_email: Optional[str] = None

