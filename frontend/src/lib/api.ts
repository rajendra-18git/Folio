import {
  DocumentItem, DocumentDetail, Conversation, ChatMessage,
  StudyGenerationResponse, CompareResponse, MultimodalAnalysisResponse,
  EvaluationRun, TestCase, SettingsStatus,
  User, AuthTokenResponse, UserLoginRequest, UserRegisterRequest
} from './types';

export function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    return isLocal
      ? 'http://localhost:8000/api'
      : 'https://folio-v52b.onrender.com/api';
  }
  return process.env.NODE_ENV === 'production'
    ? 'https://folio-v52b.onrender.com/api'
    : 'http://localhost:8000/api';
}

export const API_BASE = {
  toString: () => getApiBase(),
  valueOf: () => getApiBase(),
  replace: (target: string | RegExp, replacement: string) =>
    getApiBase().replace(target, replacement),
} as unknown as string;

export function getBackendBaseUrl(): string {
  return getApiBase().replace(/\/api\/?$/, '');
}

export function getDocumentDownloadUrl(documentId: string): string {
  return `${getApiBase()}/documents/${documentId}/download`;
}

export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('folio_token');
  }
  return null;
}

export function setStoredToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('folio_token', token);
    } else {
      localStorage.removeItem('folio_token');
    }
  }
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `API Error ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  auth: {
    async register(data: UserRegisterRequest): Promise<AuthTokenResponse> {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const authData = await handleResponse<AuthTokenResponse>(res);
      setStoredToken(authData.access_token);
      return authData;
    },

    async login(data: UserLoginRequest): Promise<AuthTokenResponse> {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const authData = await handleResponse<AuthTokenResponse>(res);
      setStoredToken(authData.access_token);
      return authData;
    },

    async getMe(): Promise<User> {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      return handleResponse<User>(res);
    },

    logout() {
      setStoredToken(null);
    },
  },

  // Documents
  async listDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE}/documents`, { 
      headers: getAuthHeaders(),
      cache: 'no-store' 
    });
    return handleResponse<DocumentItem[]>(res);
  },

  async getDocument(id: string): Promise<DocumentDetail> {
    const res = await fetch(`${API_BASE}/documents/${id}`, { 
      headers: getAuthHeaders(),
      cache: 'no-store' 
    });
    return handleResponse<DocumentDetail>(res);
  },

  async uploadDocument(file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse<DocumentItem>(res);
  },

  async deleteDocument(id: string): Promise<{ message: string; success: boolean }> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string; success: boolean }>(res);
  },

  getPageImageUrl(documentId: string, pageNumber: number): string {
    return `${API_BASE}/documents/${documentId}/pages/${pageNumber}/image`;
  },

  // Chat
  async sendMessage(question: string, documentIds: string[], conversationId?: string): Promise<{ conversation_id: string; message: ChatMessage }> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        question,
        document_ids: documentIds,
        conversation_id: conversationId,
      }),
    });
    return handleResponse<{ conversation_id: string; message: ChatMessage }>(res);
  },

  async listConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/chat/conversations`, { 
      headers: getAuthHeaders(),
      cache: 'no-store' 
    });
    return handleResponse<Conversation[]>(res);
  },

  async getConversation(id: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/chat/${id}`, { 
      headers: getAuthHeaders(),
      cache: 'no-store' 
    });
    return handleResponse<Conversation>(res);
  },

  async deleteConversation(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/chat/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Study Tools
  async generateStudyMaterial(documentId: string, studyType: string, topic?: string): Promise<StudyGenerationResponse> {
    const res = await fetch(`${API_BASE}/study/generate`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        document_id: documentId,
        study_type: studyType,
        topic: topic || undefined,
      }),
    });
    return handleResponse<StudyGenerationResponse>(res);
  },

  async getStudyHistory(documentId: string): Promise<StudyGenerationResponse[]> {
    const res = await fetch(`${API_BASE}/study/history/${documentId}`, { 
      headers: getAuthHeaders(),
      cache: 'no-store' 
    });
    return handleResponse<StudyGenerationResponse[]>(res);
  },

  // Document Comparison
  async compareDocuments(documentIds: string[], topicFocus?: string): Promise<CompareResponse> {
    const res = await fetch(`${API_BASE}/documents/compare`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        document_ids: documentIds,
        topic_focus: topicFocus || undefined,
      }),
    });
    return handleResponse<CompareResponse>(res);
  },

  async getComparisonHistory(): Promise<CompareResponse[]> {
    const res = await fetch(`${API_BASE}/documents/compare/history`, { 
      headers: getAuthHeaders(),
      cache: 'no-store' 
    });
    return handleResponse<CompareResponse[]>(res);
  },

  // Multimodal Analysis
  async analyzePage(documentId: string, pageNumber: number, analysisType: string, question?: string): Promise<MultimodalAnalysisResponse> {
    const res = await fetch(`${API_BASE}/multimodal/analyze`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        document_id: documentId,
        page_number: pageNumber,
        analysis_type: analysisType,
        question: question || undefined,
      }),
    });
    return handleResponse<MultimodalAnalysisResponse>(res);
  },

  // Evaluations
  async runEvaluations(name?: string, testCaseIds?: string[]): Promise<EvaluationRun> {
    const res = await fetch(`${API_BASE}/evaluations/run`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        name: name || 'Benchmark Evaluation Run',
        test_case_ids: testCaseIds || undefined,
      }),
    });
    return handleResponse<EvaluationRun>(res);
  },

  async listEvaluationRuns(): Promise<EvaluationRun[]> {
    const res = await fetch(`${API_BASE}/evaluations`, { 
      headers: getAuthHeaders(),
      cache: 'no-store' 
    });
    return handleResponse<EvaluationRun[]>(res);
  },

  async listTestCases(): Promise<TestCase[]> {
    const res = await fetch(`${API_BASE}/evaluations/test-cases`, { 
      headers: getAuthHeaders(),
      cache: 'no-store' 
    });
    return handleResponse<TestCase[]>(res);
  },

  async createTestCase(data: { question: string; expected_doc_id?: string; expected_doc_title?: string; expected_pages: number[]; expected_keywords: string[] }): Promise<TestCase> {
    const res = await fetch(`${API_BASE}/evaluations/test-cases`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse<TestCase>(res);
  },

  // Settings
  async getSettingsStatus(): Promise<SettingsStatus> {
    const res = await fetch(`${API_BASE}/settings/status`, { 
      headers: getAuthHeaders(),
      cache: 'no-store' 
    });
    return handleResponse<SettingsStatus>(res);
  },

  async updateApiKey(apiKey: string): Promise<{ message: string; success: boolean }> {
    const res = await fetch(`${API_BASE}/settings/api-key`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ api_key: apiKey }),
    });
    return handleResponse<{ message: string; success: boolean }>(res);
  },

  async updateModel(model: string): Promise<{ message: string; success: boolean }> {
    const res = await fetch(`${API_BASE}/settings/model`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ model }),
    });
    return handleResponse<{ message: string; success: boolean }>(res);
  },

  getBackendBaseUrl(): string {
    return getBackendBaseUrl();
  },

  getDocumentDownloadUrl(documentId: string): string {
    return getDocumentDownloadUrl(documentId);
  },

  async checkHealth(): Promise<boolean> {
    try {
      const rootUrl = getBackendBaseUrl();
      const res = await fetch(`${rootUrl}/health`, { cache: 'no-store' });
      return res.ok;
    } catch {
      return false;
    }
  },
};
