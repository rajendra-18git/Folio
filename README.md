# DocuMind AI — Grounded Document Intelligence & Study Assistant

DocuMind AI is a full-stack GenAI application for document intelligence, curriculum preparation, multi-document comparison, and multimodal visual analysis. Users upload PDFs, ask questions, receive answers grounded in their documents with interactive page-level citations, generate exam notes and quizzes, analyze diagrams and charts, and evaluate retrieval validity.

---

## 🚀 Key Features

1. **Document Ingestion & Indexing**:
   - PyMuPDF extraction preserving 1-indexed page boundaries.
   - Sliding-window chunking (800 chars, 150-char overlap) without breaking words.
   - Scanned PDF detection with optional OCR via `pytesseract`.
   - Vector indexing in ChromaDB using `all-MiniLM-L6-v2`.
   - SQLite metadata persistence with cascading chunk deletion.

2. **Grounded RAG Chat with Interactive Citations**:
   - Filter query by single, multiple, or all uploaded documents.
   - Grounded answers with exact citations: `[Document Name · Page X]`.
   - Click citation to inspect rendered high-res page image and the source excerpt.
   - Full conversation history and session persistence.
   - Prompt injection guardrails treating document text as untrusted.

3. **Study Assistant**:
   - **Executive Summaries** with bullet takeaways.
   - **2-Mark Answers** (concise definitions).
   - **5-Mark Answers** (analytical explanations).
   - **10-Mark Exam Essays** (comprehensive structured essays).
   - **Interactive Flashcards** with active-recall reveal and difficulty tags.
   - **MCQ Quiz** with real-time feedback and verified explanations.
   - **Practice Tests** with marked sections and timers.

4. **Multi-Document Comparison**:
   - Bounded 5-step agent workflow: retrieval, claim extraction, comparison, contradiction detection, and synthesis.
   - Side-by-side claims matrix table (Agreement, Contrast, Contradiction).

5. **Multimodal Visual Analysis**:
   - 150 DPI page image rendering.
   - Diagram, table, flowchart, and chart interpretation via Gemini Multimodal.

6. **Real Evaluation Dashboard**:
   - Citation Validity (direct chunk excerpt matching).
   - Page Accuracy (boundary validation).
   - Retrieval Relevance (mean cosine score).
   - Answer Completeness (ground truth keyword recall).
   - Real response latency (ms) and cost estimation ($/1M tokens).

7. **Zero-Hallucination Fallback / Demo Mode**:
   - When no Gemini API key is configured, the system never fakes AI answers.
   - Fully functional local retrieval mode displays source passages directly.
   - UI status badges indicate "Live Gemini 2.5 Flash" vs "Local Retrieval Mode".
   - Runtime API key input directly in the Settings tab.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy, SQLite.
- **Document Processing**: PyMuPDF (`fitz`), Pillow (PIL), `pytesseract`.
- **Vector Retrieval**: ChromaDB (Persistent), Sentence Transformers (`all-MiniLM-L6-v2`).
- **GenAI Provider**: Official Google Gen AI SDK (`google-genai`).

---

## 💻 Quickstart (Windows PowerShell)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### Step 1: Backend Setup

Open a PowerShell terminal:

```powershell
# Navigate to the backend directory
cd "c:\Gen AI Project\backend"

# Create a virtual environment (if not already present)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r requirements.txt

# (Optional) Configure Gemini API Key in .env
Copy-Item .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here

# Run automated tests to verify setup
pytest tests -v

# Start FastAPI server (runs on http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```

---

### Step 2: Frontend Setup

Open a second PowerShell terminal:

```powershell
# Navigate to the frontend directory
cd "c:\Gen AI Project\frontend"

# Install dependencies (already initialized)
npm install

# Build to verify production readiness
npm run build

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Configuring Gemini API Key

1. **Via UI**: Navigate to **Settings** in DocuMind AI (`http://localhost:3000/settings`), paste your Google Gemini API key into the input field, and click **Save Key**.
2. **Via `.env`**: In `c:\Gen AI Project\backend\.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash
   ```

*If no key is configured, the entire application remains functional in Local Retrieval Mode with zero hallucinated content.*

---

## 🧪 Automated Testing

DocuMind includes an automated pytest suite covering:
- API health check (`/health`)
- Upload validation (rejecting non-PDF and invalid headers)
- Real 2-page PDF generation, chunking, and ChromaDB vector indexing
- High-resolution page image rendering
- Grounded RAG query and citation extraction
- Study material generation validation
- Safe document deletion (SQL cascade + vector cleanup)
- Missing API key graceful fallback

Run tests:
```powershell
cd "c:\Gen AI Project\backend"
.\venv\Scripts\pytest.exe tests -v
```

---

## 🔒 Security & Privacy

- **API Key Isolation**: API keys remain exclusively on the backend and are never sent to client browsers.
- **Input Sanitization**: PDF magic bytes (`%PDF-`) and file sizes are strictly checked before disk persistence.
- **Path Traversal Protection**: Upload filenames are sanitized and keyed with UUIDs.
- **Prompt Injection Defense**: Uploaded document content is strictly tagged as untrusted data in system instructions.
