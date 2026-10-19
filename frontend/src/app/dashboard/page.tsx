'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { DocumentItem, SettingsStatus } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(true);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [creatingSample, setCreatingSample] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Load backend data
  const loadData = async () => {
    try {
      const [docs, setts] = await Promise.all([
        api.listDocuments().catch(() => []),
        api.getSettingsStatus().catch(() => null),
      ]);
      setDocuments(docs);
      setStatus(setts);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  // Check health and initialize nav state
  useEffect(() => {
    loadData();

    // Check backend health
    api.checkHealth()
      .then((healthy) => setIsBackendHealthy(healthy))
      .catch(() => setIsBackendHealthy(false));

    // Nav state
    const mobile = window.matchMedia('(max-width: 900px)');
    const stored = typeof window !== 'undefined' ? localStorage.getItem('folio-nav') : null;
    if (mobile.matches) {
      setNavOpen(false);
    } else if (stored === 'closed') {
      setNavOpen(false);
    } else {
      setNavOpen(true);
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && window.innerWidth <= 900) {
        setNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const handleToggleNav = () => {
    const next = !navOpen;
    setNavOpen(next);
    if (window.innerWidth > 900) {
      try {
        localStorage.setItem('folio-nav', next ? 'open' : 'closed');
      } catch {}
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Only PDF documents are supported.', 'error');
      return;
    }

    setIsUploading(true);
    showToast(`Uploading and indexing '${file.name}'...`, 'info');

    try {
      await api.uploadDocument(file);
      showToast(`'${file.name}' uploaded and indexed successfully!`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload document.', 'error');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleCreateSampleDoc = async () => {
    setCreatingSample(true);
    showToast('Generating sample study document...', 'info');
    try {
      const res = await fetch(`${api.getBackendBaseUrl()}/api/documents/upload`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          const pdfHeader =
            '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 215 >>\nstream\nBT\n/F1 12 Tf\n50 700 Td\n(Folio Sample Document - Modern Artificial Intelligence Foundations) Tj\n0 -20 Td\n(Machine learning models optimize loss functions using gradient descent.) Tj\n0 -20 Td\n(Transformers utilize multi-head self-attention mechanisms to process sequential data.) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n472\n%%EOF';
          const blob = new Blob([pdfHeader], { type: 'application/pdf' });
          formData.append('file', blob, 'AI_Architecture_Overview.pdf');
          return formData;
        })(),
      });
      if (res.ok) {
        showToast('Sample PDF uploaded and indexed successfully!', 'success');
        loadData();
      } else {
        showToast('Could not upload sample PDF.', 'error');
      }
    } catch {
      showToast('Backend unavailable. Start the Python server first.', 'error');
    } finally {
      setCreatingSample(false);
    }
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;
    const { id, original_filename: name } = docToDelete;
    setIsDeleting(true);
    try {
      await api.deleteDocument(id);
      showToast(`'${name}' deleted successfully.`, 'success');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setDocToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Could not delete document.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalChunks =
    status?.chunks_count ?? documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'U';
  };

  return (
    <div className="folio-dashboard-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <div className="app" id="app" data-nav={navOpen ? 'open' : 'closed'}>
        {/* Mobile drawer backdrop */}
        <div
          className="backdrop"
          id="backdrop"
          aria-hidden="true"
          onClick={() => setNavOpen(false)}
        />

        {/* Sidebar */}
        <aside className="sidebar" id="sidebar" aria-label="Sidebar">
          <div>
            <div className="brand">
              <svg role="img" aria-label="Folio logo mark" width="36" height="36" viewBox="0 0 120 120">
                <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" fill="#2F5BFF" />
                <path d="M72 8V38H102Z" fill="#1C3FCF" />
                <rect x="38" y="48" width="12" height="50" rx="3" fill="#fff" />
                <rect x="38" y="48" width="38" height="12" rx="3" fill="#fff" />
                <rect x="38" y="70" width="26" height="11" rx="3" fill="#fff" />
              </svg>
              <div>
                <div className="brand-name">Folio</div>
                <div className="brand-sub">Document intelligence</div>
              </div>
            </div>

            <nav className="nav" aria-label="Main">
              <Link href="/dashboard" aria-current="page">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="2" />
                  <rect x="14" y="3" width="7" height="7" rx="2" />
                  <rect x="3" y="14" width="7" height="7" rx="2" />
                  <rect x="14" y="14" width="7" height="7" rx="2" />
                </svg>
                <span>Dashboard</span>
              </Link>
              <Link href="/documents">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h8l4 4v14H6Z" />
                  <path d="M14 3v4h4" />
                </svg>
                <span>Documents</span>
              </Link>
              <Link href="/workspace">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V5Z" />
                </svg>
                <span>AI Workspace</span>
              </Link>
              <Link href="/study">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9l10-5 10 5-10 5Z" />
                  <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" />
                </svg>
                <span>Study Assistant</span>
              </Link>
              <Link href="/compare">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="7" height="16" rx="2" />
                  <rect x="14" y="4" width="7" height="16" rx="2" />
                </svg>
                <span>Doc Comparison</span>
              </Link>
              <Link href="/multimodal">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Visual Analysis</span>
              </Link>
              <Link href="/evaluations">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 20V10M12 20V4M19 20v-7" />
                </svg>
                <span>Evaluations</span>
              </Link>
              <Link href="/settings">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
                  <circle cx="16" cy="7" r="2" />
                  <circle cx="8" cy="17" r="2" />
                </svg>
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          <div className="engine">
            <strong>
              <span className="dot"></span>
              {status?.gemini_configured ? 'AI engine active' : 'Retrieval engine active'}
            </strong>
            <p>
              {status?.gemini_configured
                ? 'Grounded reasoning and multimodal analysis are enabled.'
                : 'Add Gemini API key in Settings to activate full AI generative synthesis.'}
            </p>
            <Link href="/settings">Manage settings →</Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="main">
          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-left">
              <button
                type="button"
                className="icon-btn"
                id="navToggle"
                aria-controls="sidebar"
                aria-expanded={navOpen}
                aria-label={navOpen ? 'Close sidebar' : 'Open sidebar'}
                onClick={handleToggleNav}
              >
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3A4258" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <path d="M9 4v16" />
                </svg>
              </button>
              <h2>Dashboard</h2>
              <span className="status">
                <span className="dot"></span>
                {isBackendHealthy === true ? 'Backend connected' : isBackendHealthy === false ? 'Backend offline' : 'Connecting...'}
              </span>
            </div>
            <div className="topbar-right">
              <button
                type="button"
                className="btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 16V4M7 9l5-5 5 5" />
                    <path d="M5 20h14" />
                  </svg>
                )}
                <span>{isUploading ? 'Uploading...' : 'Upload PDF'}</span>
              </button>
              <Link href="/settings" className="avatar" role="img" aria-label="Account">
                {user ? (
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C3FCF' }}>
                    {getInitials(user.full_name, user.email)}
                  </span>
                ) : (
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C3FCF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                )}
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="content">
            {/* Hero Banner */}
            <section className="hero">
              <svg className="hero-art" aria-hidden="true" width="420" height="420" viewBox="0 0 120 120" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8">
                <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" />
                <path d="M72 8V38H102" />
                <path d="M38 52H80M38 66H80M38 80H64" />
              </svg>
              <div className="hero-body">
                <span className="pill">
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
                  </svg>
                  GenAI document workspace
                </span>
                <h1>Welcome to Folio</h1>
                <p>
                  Upload course materials, research papers or documentation. Extract verified insights, prepare for exams, review citations and compare documents with grounded precision.
                </p>
                <div className="hero-actions">
                  <Link href="/workspace" className="btn-white">
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C3FCF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V5Z" />
                    </svg>
                    <span>Open AI workspace</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-ghost"
                  >
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 16V4M7 9l5-5 5 5" />
                      <path d="M5 20h14" />
                    </svg>
                    <span>Upload document</span>
                  </button>
                  {documents.length === 0 && (
                    <button
                      type="button"
                      onClick={handleCreateSampleDoc}
                      disabled={creatingSample}
                      className="btn-ghost"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      <span>{creatingSample ? 'Loading Sample...' : 'Load Sample PDF'}</span>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Stats Row */}
            <section className="row" aria-label="Workspace status">
              <div className="card stat">
                <div className="stat-col">
                  <div className="stat-label">Indexed documents</div>
                  <div className="stat-value" id="docCount">{documents.length}</div>
                </div>
                <div className="tile">
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F5BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h8l4 4v14H6Z" />
                    <path d="M14 3v4h4" />
                  </svg>
                </div>
              </div>

              <div className="card stat">
                <div className="stat-col">
                  <div className="stat-label">Vector chunks</div>
                  <div className="stat-value" id="chunkCount">{totalChunks}</div>
                </div>
                <div className="tile">
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F5BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l9 5-9 5-9-5Z" />
                    <path d="M3 13l9 5 9-5" />
                  </svg>
                </div>
              </div>

              <div className="card stat">
                <div className="stat-col">
                  <div className="stat-label">Retrieval engine</div>
                  <div className="stat-title">High-density vector index</div>
                  <div className="stat-note">1,536-D semantic embeddings</div>
                </div>
                <div className="tile">
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F5BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6Z" />
                  </svg>
                </div>
              </div>

              <div className="card stat">
                <div className="stat-col">
                  <div className="stat-label">AI synthesis core</div>
                  <span className="badge">
                    {status?.gemini_configured ? 'Production AI core' : 'Retrieval Engine Active'}
                  </span>
                  <div className="stat-note">
                    {status?.gemini_configured ? 'API connected' : 'Engine ready'}
                  </div>
                </div>
                <div className="tile green">
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B6B43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6Z" />
                    <path d="M9 12l2.2 2.2L15.5 10" />
                  </svg>
                </div>
              </div>
            </section>

            {/* Intelligence Workflows */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 className="section-title">Intelligence workflows</h2>
              <div className="row">
                <Link href="/workspace" className="wf">
                  <div className="tile solid">
                    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V5Z" />
                    </svg>
                  </div>
                  <h3>Grounded RAG chat</h3>
                  <p>Query one or many documents with verified paragraph and page-level citations. Never fabricate facts.</p>
                  <span className="go">Launch chat workspace →</span>
                </Link>

                <Link href="/study" className="wf">
                  <div className="tile">
                    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F5BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 9l10-5 10 5-10 5Z" />
                      <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" />
                    </svg>
                  </div>
                  <h3>Study assistant and exams</h3>
                  <p>Generate 2-mark definitions, 5 and 10-mark essay answers, flashcards, MCQs with explanations and diagnostic tests.</p>
                  <span className="go">Generate study material →</span>
                </Link>

                <Link href="/compare" className="wf">
                  <div className="tile">
                    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F5BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="7" height="16" rx="2" />
                      <rect x="14" y="4" width="7" height="16" rx="2" />
                    </svg>
                  </div>
                  <h3>Multi-doc comparison</h3>
                  <p>Run a bounded agent workflow that synthesizes similarities, unique viewpoints, contradictions and evidence gaps.</p>
                  <span className="go">Compare documents →</span>
                </Link>
              </div>
            </section>

            {/* Document Library */}
            <section className="library" aria-labelledby="libTitle">
              <div className="library-head">
                <div>
                  <h2 id="libTitle">Document library</h2>
                  <small>Your ingested PDFs and their vector status</small>
                </div>
                <Link href="/documents" id="viewAll">
                  View all ({documents.length}) →
                </Link>
              </div>

              <div id="docList">
                {documents.length === 0 ? (
                  <div className="empty">
                    No documents yet. Upload a PDF or click &apos;Load Sample PDF&apos; to get started.
                  </div>
                ) : (
                  documents.slice(0, 8).map((doc) => (
                    <div className="doc" key={doc.id}>
                      <div className="tile">
                        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2F5BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 3h8l4 4v14H6Z" />
                          <path d="M14 3v4h4" />
                        </svg>
                      </div>
                      <div className="doc-main">
                        <div className="doc-name">{doc.original_filename}</div>
                        <div className="doc-meta">
                          {doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'} · {doc.chunk_count} chunks indexed · {(doc.file_size_bytes / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <div className="doc-actions">
                        <Link href={`/workspace?doc=${doc.id}`} className="chip chat">
                          Chat
                        </Link>
                        <Link href={`/study?doc=${doc.id}`} className="chip study">
                          Study
                        </Link>
                        <button
                          type="button"
                          className="del"
                          aria-label={`Delete ${doc.original_filename}`}
                          onClick={() => setDocToDelete(doc)}
                        >
                          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B6478" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(14, 21, 48, 0.45)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(14, 21, 48, 0.25)',
              border: '1px solid #E3E8F3',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626',
                }}
              >
                <Trash2 style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0E1530' }}>
                  Delete Document
                </h3>
                <p style={{ fontSize: '13px', color: '#5B6478', margin: '2px 0 0' }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#3A4258', lineHeight: 1.5, margin: 0 }}>
              Are you sure you want to permanently delete{' '}
              <strong style={{ color: '#0E1530' }}>{docToDelete.original_filename}</strong>? All
              extracted text chunks, page images, and vector embeddings will be removed.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
                style={{
                  height: '40px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  border: '1px solid #D5DCEC',
                  background: '#fff',
                  color: '#3A4258',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{
                  height: '40px',
                  padding: '0 18px',
                  borderRadius: '10px',
                  border: 0,
                  background: '#DC2626',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isDeleting && <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Document'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
