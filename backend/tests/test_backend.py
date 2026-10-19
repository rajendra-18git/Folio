import io
import json
import pytest
import fitz
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import set_runtime_gemini_key
from app.services.ai_provider import ai_provider

client = TestClient(app)

def create_sample_pdf_bytes(title: str = "Test Document", content: str = "This is a test document content for DocuMind.") -> bytes:
    doc = fitz.open()
    # Page 1
    p1 = doc.new_page()
    p1.insert_text((50, 72), f"{title} - Page 1\n{content}\nQuantum computing relies on qubits and superposition principles.")
    # Page 2
    p2 = doc.new_page()
    p2.insert_text((50, 72), f"{title} - Page 2\nDecoherence is a major challenge in quantum scaling.\nSuperconducting circuits operate at millikelvin temperatures.")
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "DocuMind" in data["project"]

def test_upload_invalid_file_type():
    response = client.post(
        "/api/documents/upload",
        files={"file": ("test.txt", b"plain text is not supported", "text/plain")}
    )
    assert response.status_code == 400
    assert "Only PDF files are supported" in response.json()["detail"]

def test_upload_corrupted_pdf_header():
    response = client.post(
        "/api/documents/upload",
        files={"file": ("bad.pdf", b"NOT_A_REAL_PDF_HEADER_DATA", "application/pdf")}
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]

def test_document_lifecycle_and_extraction():
    # 1. Create a real 2-page PDF
    pdf_bytes = create_sample_pdf_bytes("Quantum Architecture", "Exploring quantum entanglement and algorithmic speedups.")
    
    # 2. Upload the PDF
    upload_res = client.post(
        "/api/documents/upload",
        files={"file": ("quantum_guide.pdf", pdf_bytes, "application/pdf")}
    )
    assert upload_res.status_code == 200
    doc_data = upload_res.json()
    doc_id = doc_data["id"]
    assert doc_data["page_count"] == 2
    assert doc_data["chunk_count"] >= 2
    assert doc_data["status"] == "ready"

    # 3. Retrieve document detail
    detail_res = client.get(f"/api/documents/{doc_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert len(detail_data["chunks"]) >= 2
    assert detail_data["chunks"][0]["page_number"] in [1, 2]

    # 4. Test page image rendering
    img_res = client.get(f"/api/documents/{doc_id}/pages/1/image")
    assert img_res.status_code == 200
    assert img_res.headers["content-type"] == "image/png"
    assert len(img_res.content) > 100

    # 5. Test missing API key fallback in Chat RAG
    from app.core.config import settings
    settings.GEMINI_API_KEY = None
    set_runtime_gemini_key(None) # Ensure unconfigured for deterministic fallback testing
    chat_res = client.post(
        "/api/chat",
        json={
            "question": "What is quantum computing based on?",
            "document_ids": [doc_id]
        }
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    msg = chat_data["message"]
    assert msg["is_demo_mode"] is True
    assert len(msg["citations"]) > 0
    # Check citation accuracy
    first_citation = msg["citations"][0]
    assert first_citation["document_id"] == doc_id
    assert first_citation["page_number"] in [1, 2]
    assert "qubits" in first_citation["excerpt"].lower() or "quantum" in first_citation["excerpt"].lower()

    # 6. Test Study Generation
    study_res = client.post(
        "/api/study/generate",
        json={
            "document_id": doc_id,
            "study_type": "flashcards",
            "topic": "Quantum Basics"
        }
    )
    assert study_res.status_code == 200
    study_data = study_res.json()
    assert study_data["study_type"] == "flashcards"
    assert len(study_data["data"]["flashcards"]) > 0

    # 7. Test Delete Document
    del_res = client.delete(f"/api/documents/{doc_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 8. Confirm document is gone
    get_res = client.get(f"/api/documents/{doc_id}")
    assert get_res.status_code == 404

def test_missing_document_handling():
    res = client.get("/api/documents/non-existent-uuid-12345")
    assert res.status_code == 404

def test_settings_status_endpoint():
    res = client.get("/api/settings/status")
    assert res.status_code == 200
    data = res.json()
    assert "vector_store" in data
    assert "gemini_model" in data

def test_auth_workflow():
    import uuid
    unique_email = f"test_{uuid.uuid4().hex[:8]}@foliotest.com"
    password = "SecurePassword123!"

    # 1. Register new user
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": unique_email,
            "password": password,
            "full_name": "Test Tester"
        }
    )
    assert reg_res.status_code == 201
    auth_data = reg_res.json()
    assert "access_token" in auth_data
    assert auth_data["user"]["email"] == unique_email
    assert auth_data["user"]["full_name"] == "Test Tester"

    token = auth_data["access_token"]

    # 2. Duplicate registration should fail
    dup_res = client.post(
        "/api/auth/register",
        json={
            "email": unique_email,
            "password": password
        }
    )
    assert dup_res.status_code == 400

    # 3. Login with correct credentials
    login_res = client.post(
        "/api/auth/login",
        json={
            "email": unique_email,
            "password": password
        }
    )
    assert login_res.status_code == 200
    login_token = login_res.json()["access_token"]

    # 4. Login with wrong password should fail
    bad_login = client.post(
        "/api/auth/login",
        json={
            "email": unique_email,
            "password": "wrongpassword"
        }
    )
    assert bad_login.status_code == 401

    # 5. Fetch profile with token
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {login_token}"}
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email

    # 6. Fetch profile without token should be 401
    unauth_res = client.get("/api/auth/me")
    assert unauth_res.status_code == 401

def test_supabase_configuration_and_embeddings():
    from app.core.config import Settings
    from app.services.vector_store import vector_store
    from app.models.db_models import DocumentChunk
    
    # 1. Verify embedding dimension and generation
    emb = ai_provider.get_embedding("Deep learning and quantum computing.")
    assert isinstance(emb, list)
    assert len(emb) == 768
    
    # 2. Verify batch embedding generation
    batch = ai_provider.get_embeddings(["Passage 1", "Passage 2"])
    assert len(batch) == 2
    assert len(batch[0]) == 768
    assert len(batch[1]) == 768

    # 3. Verify DocumentChunk model has pgvector embedding column
    assert hasattr(DocumentChunk, "embedding")

    # 4. Verify Supabase URL normalization
    s = Settings(
        DATABASE_URL="postgres://postgres.abc:mypass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
    )
    normalized = s.get_effective_database_url()
    assert normalized.startswith("postgresql+psycopg2://")
    assert s.is_postgres() is True
    assert s.is_supabase() is True

