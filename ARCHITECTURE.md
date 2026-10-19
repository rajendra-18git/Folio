# DocuMind AI — System Architecture & Design Specification

DocuMind AI is a full-stack, enterprise-grade document intelligence and study assistant platform designed with modular separation of concerns across presentation, retrieval, generation, and persistence layers.

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NEXT.JS 16 CLIENT APPLICATION                         │
│  - App Router & TypeScript                                                  │
│  - Tailwind CSS Premium SaaS Design System                                  │
│  - Lucide Icons & Responsive Glassmorphic Layouts                           │
│  - Interactive Citation Inspector & Rendered Page Image Viewer              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST API (FastAPI)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI BACKEND SERVICE                           │
│                                                                             │
│  ┌───────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │   Documents API   │  │       Chat RAG       │  │    Study Assistant   │  │
│  │   (Upload/Chunks) │  │  (Grounded Answers)  │  │   (Exams/Quizzes)    │  │
│  └─────────┬─────────┘  └──────────┬───────────┘  └──────────┬───────────┘  │
│            │                       │                         │              │
│  ┌─────────▼─────────┐  ┌──────────▼───────────┐  ┌──────────▼───────────┐  │
│  │  PyMuPDF Parser   │  │   Vector Retrieval   │  │  Evaluation Service  │  │
│  │  & OCR Pipeline   │  │  (Cosine Similarity) │  │  (Real Benchmark Run)│  │
│  └───────────────────┘  └──────────┬───────────┘  └──────────────────────┘  │
│                                    │                                        │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐  │
│  │                       AI PROVIDER ABSTRACTION                         │  │
│  │  - Official Google Gen AI SDK (`google-genai`)                        │  │
│  │  - Gemini 2.5 Flash / Gemini 1.5 Flash Grounded Generation            │  │
│  │  - Multimodal Page Vision Reasoning                                   │  │
│  │  - Zero-Hallucination Local Extractive Fallback Mode                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┬──────────────┘
                       │                                       │
                       ▼                                       ▼
    ┌─────────────────────────────────────┐ ┌─────────────────────────────────┐
    │          SQL RELATIONAL DB          │ │        LOCAL VECTOR STORE       │
    │  - SQLite (Local Development)       │ │  - ChromaDB (Persistent)        │
    │  - Document & Chunk Metadata        │ │  - all-MiniLM-L6-v2 Embeddings  │
    │  - Chat History & Evaluations       │ │  - Document ID Sub-Filtering    │
    │  *(Migratable to PostgreSQL/Cloud)* │ │  *(Migratable to Vertex Vector)*│
    └─────────────────────────────────────┘ └─────────────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Document Ingestion & Chunking Pipeline (`pdf_service.py`)
1. **Validation**: Verifies binary magic bytes (`%PDF-`), enforces file-size limits (25MB max), sanitizes filenames to prevent path traversal attacks.
2. **Text Extraction**: Uses PyMuPDF (`fitz`) to extract page-by-page text blocks while preserving exact 1-indexed page boundaries.
3. **Scanned PDF Handling**: Detects low text density (<40 characters/page) and flags the document as scanned, with optional OCR extraction via `pytesseract`.
4. **Chunking**: Applies sentence-aware sliding window chunking (800 characters, 150-character overlap) without cutting words in half. Each chunk is tagged with `chunk_index`, `page_number`, `token_count`, and `document_id`.
5. **Page Rendering**: Dynamically renders high-resolution (150 DPI) PNG page images for multimodal vision inspection and visual citation verification.

### 2.2 Grounded Retrieval-Augmented Generation (`rag_service.py`)
1. **Query Filtering**: Searches ChromaDB using cosine distance, restricted strictly to the user's selected `document_ids`.
2. **Prompt Construction**: Grounded prompt contains extracted passages formatted with `[Source: {doc_name} | Page: {page_no}]`.
3. **Safety & Injection Guardrails**: System instructions explicitly treat document text as untrusted data, ignoring prompt injection attempts and prohibiting hallucinated claims.
4. **Citations & Verification**: For every statement, the frontend displays interactive badges (`CitationBadge`). Clicking opens the `PdfViewerModal`, which loads the original rendered page image alongside the highlighted source excerpt.
5. **Zero-Hallucination Fallback**: When no `GEMINI_API_KEY` is present, the system does not fabricate answers; it returns formatted extractive source passages labeled `is_demo_mode: true`.

### 2.3 Study Assistant Engine (`study_service.py`)
Generates validated, structured outputs across 7 educational formats:
- **Executive Summaries**: High-level synthesis with key takeaway bullet points.
- **2-Mark Answers**: Crisp definitions, formulas, and fundamental principles.
- **5-Mark Answers**: Structured conceptual explanations with bulleted points.
- **10-Mark Exam Essays**: Comprehensive academic essays with introduction, analytical sections, and conclusions.
- **Flashcards**: Interactive active-recall cards with difficulty levels and page numbers.
- **MCQ Quizzes**: 4-option questions with real-time feedback and explanation rationale.
- **Diagnostic Practice Tests**: Timed mock exams with sectional point distributions.

### 2.4 Bounded Document Comparison Workflow (`comparison_agent.py`)
Unlike unpredictable, unconstrained agents, DocuMind uses a bounded, deterministic 5-step workflow:
1. **Bounded Retrieval**: Queries each document independently for core methodology and claims.
2. **Fact Extraction**: Summarizes distinct evidence blocks per document.
3. **Claims Matrix**: Maps points of Agreement, Contrast, and Contradiction into a structured matrix.
4. **Evidence Gap Analysis**: Highlights unanswered questions and missing empirical data.
5. **Synthesis Report**: Produces a unified comparative report with source citations.

### 2.5 Real Evaluation Benchmarking (`eval_service.py`)
Measures quantitative performance without fabricating analytics:
- **Citation Validity**: Checks whether cited text excerpts correspond to stored document chunks.
- **Page Validity**: Confirms cited page references do not exceed the document's total page count.
- **Retrieval Relevance**: Mean cosine similarity score of top-k retrieved chunks.
- **Answer Completeness**: Ground truth keyword recall against benchmark test cases.
- **Latency & Cost**: Real elapsed execution time in milliseconds and token cost estimates ($0.10/1M tokens).

---

## 3. Migration Guide to Google Cloud Enterprise

DocuMind's modular architecture makes transitioning to Google Cloud enterprise services seamless:

| Component | Current Local Architecture | Google Cloud Production Target | Migration Step |
| :--- | :--- | :--- | :--- |
| **Relational DB** | SQLite (`documind.db`) | **Cloud SQL for PostgreSQL** | Update `DATABASE_URL` in `config.py` to `postgresql+psycopg2://user:pass@host/documind`. |
| **Vector Storage** | ChromaDB (Local Persistent) | **Vertex AI Vector Search** | Implement `VertexVectorStore` implementing `search()` and `add_chunks()`. |
| **Document Storage** | Local directory (`data/uploads`) | **Google Cloud Storage (GCS)** | Store PDF blobs in a Cloud Storage bucket and store GCS URIs in SQL. |
| **Model Hosting** | Gemini API (`google-genai`) | **Vertex AI Gemini 2.5 Flash** | Switch authentication to Application Default Credentials (`google.auth`). |
| **App Deployment** | Local Uvicorn & Next.js | **Cloud Run (Containers)** | Deploy backend as FastAPI container and frontend as Next.js standalone container. |
