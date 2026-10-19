# DocuMind AI — REST API Documentation

Base URL: `http://localhost:8000/api`

---

## 1. System Health & Diagnostics

### `GET /health`
Returns system status and model readiness.
```json
{
  "status": "healthy",
  "project": "DocuMind AI",
  "version": "1.0.0",
  "gemini_ready": true
}
```

---

## 2. Document Management

### `POST /api/documents/upload`
Uploads and indexes a PDF document.
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (PDF file, max 25MB)
- **Response**: `DocumentResponse`
```json
{
  "id": "c1f7a0b3-82a4-4f01-92b1-50e50c41b803",
  "filename": "Quantum_Guide.pdf",
  "original_filename": "Quantum Guide.pdf",
  "file_size_bytes": 142050,
  "page_count": 8,
  "chunk_count": 24,
  "status": "ready",
  "error_message": null,
  "created_at": "2026-10-10T21:40:00Z",
  "updated_at": "2026-10-10T21:40:02Z"
}
```

### `GET /api/documents`
Lists all uploaded documents.

### `GET /api/documents/{document_id}`
Returns details for a single document including all extracted chunks and page mappings.

### `DELETE /api/documents/{document_id}`
Deletes the document record, associated chunks in SQLite, files from disk, and vector embeddings in ChromaDB.

### `GET /api/documents/{document_id}/pages/{page_number}/image`
Returns a high-resolution PNG image of the specified 1-indexed PDF page.
- **Response**: `image/png` binary stream.

### `GET /api/documents/{document_id}/download`
Streams the original PDF file.

---

## 3. Grounded RAG Chat

### `POST /api/chat`
Submits a user query against selected documents.
- **Request Body**:
```json
{
  "conversation_id": "optional-uuid",
  "question": "What is decoherence in quantum computing?",
  "document_ids": ["c1f7a0b3-82a4-4f01-92b1-50e50c41b803"]
}
```
- **Response**:
```json
{
  "conversation_id": "b3e020d2-11cf-4d92-bf39-446c6ec22340",
  "message": {
    "id": "e9b5f412-2580-496e-a50d-d03b0c67990c",
    "role": "assistant",
    "content": "According to Quantum Guide (Page 2), decoherence occurs when quantum systems interact with their environment...",
    "citations": [
      {
        "document_id": "c1f7a0b3-82a4-4f01-92b1-50e50c41b803",
        "document_name": "Quantum Guide.pdf",
        "page_number": 2,
        "chunk_index": 3,
        "excerpt": "Decoherence is a major challenge in quantum scaling caused by thermal fluctuations...",
        "score": 0.892
      }
    ],
    "is_demo_mode": false,
    "latency_ms": 320.5,
    "created_at": "2026-10-10T21:41:00Z"
  }
}
```

### `GET /api/chat/conversations`
Lists all chat conversations with message counts and timestamps.

### `GET /api/chat/{conversation_id}`
Retrieves a full conversation transcript with citations.

### `DELETE /api/chat/{conversation_id}`
Deletes a conversation and its messages.

---

## 4. Study Assistant

### `POST /api/study/generate`
Generates structured study material for a document.
- **Request Body**:
```json
{
  "document_id": "c1f7a0b3-82a4-4f01-92b1-50e50c41b803",
  "study_type": "flashcards", // summary | two_mark | five_mark | ten_mark | flashcards | mcqs | practice_test
  "topic": "Quantum Gates"
}
```
- **Response**: `StudyGenerateResponse` with structured schema.

### `GET /api/study/history/{document_id}`
Lists previous study material generations for a given document.

---

## 5. Multi-Document Comparison

### `POST /api/documents/compare`
Runs bounded multi-document comparison.
- **Request Body**:
```json
{
  "document_ids": ["id-1", "id-2"],
  "topic_focus": "Empirical results and limitations"
}
```
- **Response**:
```json
{
  "id": "comp-uuid",
  "document_ids": ["id-1", "id-2"],
  "report": {
    "executive_summary": "Comparative synthesis across documents...",
    "key_similarities": ["..."],
    "key_differences": ["..."],
    "claims_matrix": [
      {
        "topic": "Scaling Limits",
        "document_a_view": "Emphasizes hardware decoherence.",
        "document_b_view": "Emphasizes error correction code overhead.",
        "status": "Contrast"
      }
    ],
    "contradictions": ["..."],
    "evidence_gaps": ["..."],
    "synthesis_conclusion": "...",
    "citations": [...]
  }
}
```

---

## 6. Multimodal Visual Analysis

### `POST /api/multimodal/analyze`
Extracts visual reasoning from a rendered PDF page.
- **Request Body**:
```json
{
  "document_id": "c1f7a0b3-82a4-4f01-92b1-50e50c41b803",
  "page_number": 3,
  "analysis_type": "diagram", // general | diagram | table | chart | visual_qa
  "question": "Explain the circuit diagram."
}
```

---

## 7. Evaluation Engine

### `POST /api/evaluations/run`
Executes automated benchmark evaluation measuring Citation Validity, Page Validity, Cosine Relevance, Completeness, Latency, and Estimated Cost.

### `GET /api/evaluations`
Retrieves history of evaluation runs.

### `POST /api/evaluations/test-cases`
Adds a benchmark question with expected documents and page numbers.

---

## 8. Settings & Model Configuration

### `GET /api/settings/status`
Returns active AI configuration, database type, and vector counts.

### `POST /api/settings/api-key`
Sets or updates the Gemini API key at runtime.
