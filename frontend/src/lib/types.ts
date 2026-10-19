export interface DocumentItem {
  id: string;
  filename: string;
  original_filename: string;
  file_size_bytes: number;
  page_count: number;
  chunk_count: number;
  status: 'processing' | 'ready' | 'error';
  error_message?: string | null;
  summary?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  chunk_index: number;
  page_number: number;
  content: string;
  token_count: number;
}

export interface DocumentDetail extends DocumentItem {
  chunks: DocumentChunk[];
}

export interface Citation {
  document_id: string;
  document_name: string;
  page_number: number;
  chunk_index?: number;
  excerpt: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations: Citation[];
  is_demo_mode: boolean;
  latency_ms: number;
  tokens_used?: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface FlashcardItem {
  question: string;
  answer: string;
  difficulty: string;
  page_number?: number;
}

export interface MCQItem {
  question: string;
  options: string[];
  correct_option: string;
  explanation: string;
  page_number?: number;
}

export interface ExamAnswerItem {
  question: string;
  marks: number;
  key_points: string[];
  detailed_answer: string;
  page_references: number[];
}

export interface PracticeTestItem {
  title: string;
  duration_minutes: number;
  total_marks: number;
  sections: Array<{
    section_name: string;
    questions: string[];
  }>;
}

export interface StudyContent {
  study_type: string;
  topic?: string;
  document_name: string;
  summary_markdown?: string;
  key_takeaways?: string[];
  exam_answers?: ExamAnswerItem[];
  flashcards?: FlashcardItem[];
  mcqs?: MCQItem[];
  practice_test?: PracticeTestItem;
  citations: Citation[];
  is_demo_mode: boolean;
  tokens_used?: number;
  latency_ms?: number;
}

export interface StudyGenerationResponse {
  id: string;
  document_id: string;
  study_type: string;
  topic?: string;
  data: StudyContent;
  created_at: string;
}

export interface ComparisonClaim {
  topic: string;
  document_a_view: string;
  document_b_view: string;
  status: string;
  citations?: Citation[];
}

export interface ComparisonReport {
  documents: Array<{ id: string; title: string }>;
  executive_summary: string;
  key_similarities: string[];
  key_differences: string[];
  claims_matrix: ComparisonClaim[];
  contradictions: string[];
  evidence_gaps: string[];
  synthesis_conclusion: string;
  citations: Citation[];
  is_demo_mode: boolean;
  tokens_used?: number;
  latency_ms?: number;
}

export interface CompareResponse {
  id: string;
  document_ids: string[];
  report: ComparisonReport;
  created_at: string;
}

export interface MultimodalAnalysisResponse {
  document_id: string;
  page_number: number;
  analysis_type: string;
  extracted_insights: string;
  diagram_description?: string;
  table_data_markdown?: string;
  chart_interpretation?: string;
  answer?: string;
  image_preview_url: string;
  is_configured: boolean;
  is_demo_mode: boolean;
  tokens_used?: number;
  latency_ms?: number;
}

export interface EvalResultDetail {
  test_case_id: string;
  question: string;
  generated_answer: string;
  citations_count: number;
  citation_validity: number;
  page_validity: number;
  relevance_score: number;
  completeness_score: number;
  latency_ms: number;
  tokens_used: number;
  cost_usd: number;
}

export interface EvaluationRun {
  id: string;
  name: string;
  test_cases_count: number;
  citation_validity_score: number;
  page_validity_score: number;
  retrieval_relevance_score: number;
  answer_completeness_score: number;
  avg_latency_ms: number;
  total_tokens: number;
  estimated_cost_usd: number;
  details: EvalResultDetail[];
  created_at: string;
}

export interface TestCase {
  id: string;
  question: string;
  expected_doc_id?: string;
  expected_doc_title?: string;
  expected_pages: number[];
  expected_keywords: string[];
  created_at: string;
}

export interface SettingsStatus {
  gemini_configured: boolean;
  gemini_model: string;
  embedding_provider: string;
  vector_store: string;
  documents_count: number;
  chunks_count: number;
  database_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface SendOtpRequest {
  email: string;
  purpose?: 'login' | 'register';
}

export interface SendOtpResponse {
  message: string;
  email: string;
  expires_in_seconds: number;
  email_sent: boolean;
  debug_hint?: string | null;
}

export interface VerifyOtpLoginRequest {
  email: string;
  otp_code: string;
}

export interface RegisterWithOtpRequest {
  email: string;
  password: string;
  full_name?: string;
  otp_code: string;
}


