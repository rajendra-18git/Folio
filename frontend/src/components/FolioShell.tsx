'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface FolioShellProps {
  children: React.ReactNode;
  activeRoute:
    | '/dashboard'
    | '/documents'
    | '/workspace'
    | '/study'
    | '/compare'
    | '/multimodal'
    | '/evaluations'
    | '/settings';
  pageTitle: string;
  onDocumentUploaded?: () => void;
}

export function FolioShell({
  children,
  activeRoute,
  pageTitle,
  onDocumentUploaded,
}: FolioShellProps) {
  const [navOpen, setNavOpen] = useState(true);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [isEngineConfigured, setIsEngineConfigured] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    // Check backend health
    api.checkHealth()
      .then((healthy) => setIsBackendHealthy(healthy))
      .catch(() => setIsBackendHealthy(false));

    // Check engine status
    api.getSettingsStatus()
      .then((s) => setIsEngineConfigured(s.gemini_configured))
      .catch(() => setIsEngineConfigured(false));

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
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload document.', 'error');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

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
              <Link href="/dashboard" aria-current={activeRoute === '/dashboard' ? 'page' : undefined}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="2" />
                  <rect x="14" y="3" width="7" height="7" rx="2" />
                  <rect x="3" y="14" width="7" height="7" rx="2" />
                  <rect x="14" y="14" width="7" height="7" rx="2" />
                </svg>
                <span>Dashboard</span>
              </Link>
              <Link href="/documents" aria-current={activeRoute === '/documents' ? 'page' : undefined}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h8l4 4v14H6Z" />
                  <path d="M14 3v4h4" />
                </svg>
                <span>Documents</span>
              </Link>
              <Link href="/workspace" aria-current={activeRoute === '/workspace' ? 'page' : undefined}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V5Z" />
                </svg>
                <span>AI Workspace</span>
              </Link>
              <Link href="/study" aria-current={activeRoute === '/study' ? 'page' : undefined}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9l10-5 10 5-10 5Z" />
                  <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" />
                </svg>
                <span>Study Assistant</span>
              </Link>
              <Link href="/compare" aria-current={activeRoute === '/compare' ? 'page' : undefined}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="7" height="16" rx="2" />
                  <rect x="14" y="4" width="7" height="16" rx="2" />
                </svg>
                <span>Doc Comparison</span>
              </Link>
              <Link href="/multimodal" aria-current={activeRoute === '/multimodal' ? 'page' : undefined}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Visual Analysis</span>
              </Link>
              <Link href="/evaluations" aria-current={activeRoute === '/evaluations' ? 'page' : undefined}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 20V10M12 20V4M19 20v-7" />
                </svg>
                <span>Evaluations</span>
              </Link>
              <Link href="/settings" aria-current={activeRoute === '/settings' ? 'page' : undefined}>
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
              {isEngineConfigured ? 'AI engine active' : 'Retrieval engine active'}
            </strong>
            <p>
              {isEngineConfigured
                ? 'Grounded reasoning and multimodal analysis are enabled.'
                : 'Add Gemini API key in Settings to activate full AI generative synthesis.'}
            </p>
            <Link href="/settings">Manage settings →</Link>
          </div>
        </aside>

        {/* Main Section */}
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
              <h2>{pageTitle}</h2>
              <span className={`status ${isBackendHealthy === true ? 'status-connected' : isBackendHealthy === false ? 'status-offline' : 'status-connecting'}`}>
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

          {/* Children View */}
          {children}
        </div>
      </div>
    </div>
  );
}
