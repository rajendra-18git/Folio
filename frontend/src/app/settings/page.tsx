'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { SettingsStatus } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-flash-latest');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' | '' }>({ text: '', type: '' });
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchStatus = async () => {
    try {
      const data = await api.getSettingsStatus();
      setStatus(data);
      if (data.gemini_model) {
        setSelectedModel(data.gemini_model);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();

    const check = () => {
      api.checkHealth()
        .then((healthy) => setIsBackendHealthy(healthy))
        .catch(() => setIsBackendHealthy(false));
    };

    check();
    const interval = setInterval(check, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleShow = () => {
    setShowKey((prev) => !prev);
  };

  const handleSaveKey = async () => {
    const v = apiKeyInput.trim();
    if (!v) {
      setMsg({ text: 'Enter an API key to save.', type: 'err' });
      return;
    }

    setSavingKey(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await api.updateApiKey(v);
      if (res.success) {
        setMsg({ text: 'Key saved and validated.', type: 'ok' });
        showToast('API key saved successfully!', 'success');
        setApiKeyInput('');
        fetchStatus();
      } else {
        setMsg({ text: res.message || 'Failed to save key.', type: 'err' });
        showToast(res.message || 'Failed to save key.', 'error');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to save key.';
      setMsg({ text: errMsg, type: 'err' });
      showToast(errMsg, 'error');
    } finally {
      setSavingKey(false);
    }
  };

  const handleModelChange = async (newModel: string) => {
    setSelectedModel(newModel);
    try {
      const res = await api.updateModel(newModel);
      showToast(res.message || `Switched to ${newModel}`, 'success');
      fetchStatus();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update model tier.', 'error');
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
    showToast(`Uploading '${file.name}'...`, 'info');
    try {
      await api.uploadDocument(file);
      showToast(`'${file.name}' uploaded and indexed successfully!`, 'success');
      fetchStatus();
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload document.', 'error');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const isConfigured = Boolean(status?.gemini_configured);
  const userInitials = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'R';
  const userName = user?.full_name || (user?.email ? user.email.split('@')[0] : 'rajendra');

  return (
    <div className="folio-settings-container">
      {/* Hidden File Input for Topbar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <style jsx global>{`
        :root {
          --navy: #0a2a66;
          --blue: #1d4ed8;
          --blue-2: #2563eb;
          --sky: #dbeafe;
          --ice: #f1f6ff;
          --line: #d8e4f8;
          --text: #10244a;
          --muted: #5a6f94;
          --ok: #0e7c66;
          --ok-bg: #e3f6f1;
          --warn-bg: #fff7e0;
          --warn: #8a6100;
          --err: #b42318;
          --err-bg: #fee4e2;
        }
        .folio-settings-container {
          font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          letter-spacing: -0.005em;
          background: var(--ice);
          color: var(--text);
          font-size: 14px;
          min-height: 100vh;
          display: flex;
          width: 100%;
        }
        .folio-settings-container * {
          box-sizing: border-box;
        }
        .folio-settings-container h1,
        .folio-settings-container h2,
        .folio-settings-container h3,
        .folio-settings-container h4,
        .folio-settings-container .brand b,
        .folio-settings-container .banner strong,
        .folio-settings-container .tile strong {
          font-family: 'Sora', sans-serif;
          letter-spacing: -0.02em;
        }
        .folio-settings-container button,
        .folio-settings-container input,
        .folio-settings-container select {
          font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .folio-settings-container a {
          color: inherit;
          text-decoration: none;
        }

        /* Sidebar */
        .folio-settings-container .sidebar {
          width: 248px;
          background: #fff;
          border-right: 1px solid var(--line);
          padding: 20px 14px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
          z-index: 20;
        }
        .folio-settings-container .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 10px 22px;
        }
        .folio-settings-container .logo {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--blue);
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 20px;
        }
        .folio-settings-container .brand b {
          display: block;
          font-size: 17px;
          color: var(--navy);
        }
        .folio-settings-container .brand small {
          color: var(--muted);
          font-size: 12px;
        }
        .folio-settings-container .nav {
          display: flex;
          flex-direction: column;
        }
        .folio-settings-container .nav a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          color: var(--muted);
          font-weight: 500;
          margin-bottom: 3px;
          transition: background 0.15s, color 0.15s;
        }
        .folio-settings-container .nav a:hover {
          background: var(--ice);
          color: var(--blue);
        }
        .folio-settings-container .nav a.active {
          background: var(--blue);
          color: #fff;
          font-weight: 600;
        }
        .folio-settings-container .nav svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        /* Main Content */
        .folio-settings-container .content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .folio-settings-container .topbar {
          height: 64px;
          background: #fff;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .folio-settings-container .topbar h2 {
          font-size: 16px;
          color: var(--navy);
          font-weight: 600;
        }
        .folio-settings-container .status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--ok-bg);
          color: var(--ok);
          border-radius: 99px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .folio-settings-container .status.offline {
          background: var(--err-bg);
          color: var(--err);
        }
        .folio-settings-container .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }
        .folio-settings-container .spacer {
          flex: 1;
        }
        .folio-settings-container .btn {
          height: 42px;
          padding: 0 22px;
          border: 0;
          border-radius: 10px;
          background: var(--blue);
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .folio-settings-container .btn:hover {
          background: #1e40af;
        }
        .folio-settings-container .btn.ghost {
          background: #fff;
          color: var(--blue);
          border: 1px solid var(--blue);
        }
        .folio-settings-container .btn.ghost:hover {
          background: var(--sky);
        }
        .folio-settings-container .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .folio-settings-container button:focus-visible,
        .folio-settings-container input:focus-visible,
        .folio-settings-container select:focus-visible,
        .folio-settings-container a:focus-visible {
          outline: 2px solid var(--blue-2);
          outline-offset: 2px;
        }
        .folio-settings-container .user {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--ice);
          padding: 4px 14px 4px 4px;
          border-radius: 99px;
          font-weight: 500;
        }
        .folio-settings-container .avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--blue);
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 12px;
        }

        .folio-settings-container main {
          padding: 36px 28px 64px;
          overflow-y: auto;
        }
        .folio-settings-container .wrap {
          max-width: 920px;
          margin: 0 auto;
        }
        .folio-settings-container h1 {
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--navy);
        }
        .folio-settings-container .sub {
          color: var(--muted);
          margin: 6px 0 26px;
        }

        /* Banner */
        .folio-settings-container .banner {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--navy);
          color: #fff;
          border-radius: 14px;
          padding: 18px 22px;
          margin-bottom: 24px;
        }
        .folio-settings-container .banner .pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 5px rgba(74, 222, 128, 0.25);
          flex-shrink: 0;
        }
        .folio-settings-container .banner strong {
          display: block;
          font-size: 15px;
        }
        .folio-settings-container .banner span {
          color: #bcd0f5;
          font-size: 13px;
        }

        /* Cards */
        .folio-settings-container .card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 26px;
          margin-bottom: 22px;
        }
        .folio-settings-container .card-head {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 22px;
        }
        .folio-settings-container .icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--sky);
          color: var(--blue);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .folio-settings-container .icon-box svg {
          width: 22px;
          height: 22px;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .folio-settings-container .card-head h3 {
          font-size: 17px;
          color: var(--navy);
          font-weight: 700;
        }
        .folio-settings-container .card-head p {
          color: var(--muted);
          font-size: 13px;
          margin-top: 2px;
        }
        .folio-settings-container .badge {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 99px;
          padding: 6px 14px;
          font-weight: 600;
          font-size: 12px;
          white-space: nowrap;
          background: var(--warn-bg);
          color: var(--warn);
        }
        .folio-settings-container .badge.on {
          background: var(--ok-bg);
          color: var(--ok);
        }
        .folio-settings-container label {
          display: block;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 8px;
          color: var(--navy);
        }
        .folio-settings-container select,
        .folio-settings-container input {
          width: 100%;
          height: 44px;
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 0 14px;
          font: inherit;
          color: var(--text);
          background: #fff;
        }
        .folio-settings-container .hint {
          font-size: 12px;
          color: var(--muted);
          margin-top: 8px;
        }
        .folio-settings-container .field {
          margin-bottom: 22px;
        }
        .folio-settings-container .note {
          background: var(--ice);
          border: 1px solid var(--line);
          border-left: 4px solid var(--blue);
          border-radius: 10px;
          padding: 16px 18px;
          margin-bottom: 22px;
        }
        .folio-settings-container .note h4 {
          font-size: 14px;
          color: var(--navy);
          margin-bottom: 6px;
          font-weight: 700;
        }
        .folio-settings-container .note p {
          color: var(--muted);
          line-height: 1.55;
          font-size: 13px;
        }
        .folio-settings-container .key-row {
          display: flex;
          gap: 10px;
        }
        .folio-settings-container .msg {
          font-size: 13px;
          margin-top: 10px;
          min-height: 18px;
          font-weight: 600;
        }
        .folio-settings-container .msg.ok {
          color: var(--ok);
        }
        .folio-settings-container .msg.err {
          color: var(--err);
        }

        /* Stack tiles */
        .folio-settings-container .stack {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .folio-settings-container .tile {
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 16px;
          background: var(--ice);
        }
        .folio-settings-container .tile .k {
          color: var(--blue);
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .folio-settings-container .tile strong {
          display: block;
          color: var(--navy);
          font-size: 15px;
          margin-bottom: 4px;
          font-weight: 700;
        }
        .folio-settings-container .tile span {
          color: var(--muted);
          font-size: 12px;
        }

        @media (max-width: 860px) {
          .folio-settings-container {
            flex-direction: column;
          }
          .folio-settings-container .sidebar {
            width: 100%;
            height: auto;
            position: static;
            flex-direction: column;
            padding: 12px;
          }
          .folio-settings-container .brand {
            padding-bottom: 10px;
          }
          .folio-settings-container .nav {
            flex-direction: row;
            overflow-x: auto;
            gap: 6px;
          }
          .folio-settings-container .nav a {
            white-space: nowrap;
            margin: 0;
          }
          .folio-settings-container .stack {
            grid-template-columns: 1fr;
          }
          .folio-settings-container .key-row {
            flex-direction: column;
          }
          .folio-settings-container .card-head {
            flex-wrap: wrap;
          }
          .folio-settings-container .badge {
            margin-left: 0;
          }
          .folio-settings-container .topbar {
            padding: 0 14px;
          }
          .folio-settings-container .topbar h2,
          .folio-settings-container .user span {
            display: none;
          }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">F</div>
          <div>
            <b>Folio</b>
            <small>Document intelligence</small>
          </div>
        </div>
        <nav className="nav">
          <Link href="/dashboard">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            Dashboard
          </Link>
          <Link href="/documents">
            <svg viewBox="0 0 24 24">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5" />
            </svg>
            Documents
          </Link>
          <Link href="/workspace">
            <svg viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            AI Workspace
          </Link>
          <Link href="/study">
            <svg viewBox="0 0 24 24">
              <path d="M22 10 12 5 2 10l10 5z" />
              <path d="M6 12v5c3 2 9 2 12 0v-5" />
            </svg>
            Study Assistant
          </Link>
          <Link href="/compare">
            <svg viewBox="0 0 24 24">
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="18" r="3" />
              <path d="M6 9v3a3 3 0 0 0 3 3h6" />
            </svg>
            Doc Comparison
          </Link>
          <Link href="/multimodal">
            <svg viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Visual Analysis
          </Link>
          <Link href="/evaluations">
            <svg viewBox="0 0 24 24">
              <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
            </svg>
            Evaluations
          </Link>
          <Link href="/settings" className="active" aria-current="page">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="content">
        <header className="topbar">
          <h2>Document Intelligence &amp; Study Assistant</h2>
          <span className={`status ${isBackendHealthy === false ? 'offline' : ''}`}>
            <span className="dot"></span>
            {isBackendHealthy === false ? 'Backend offline' : 'Backend connected'}
          </span>
          <div className="spacer"></div>
          <button
            className="btn ghost"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload PDF'}
          </button>
          <div className="user">
            <div className="avatar">{userInitials}</div>
            <span>{userName}</span>
          </div>
        </header>

        <main>
          <div className="wrap">
            <h1>Settings</h1>
            <p className="sub">Manage your AI engine, API key, and storage.</p>

            <div className="banner">
              <span className="pulse"></span>
              <div>
                <strong>
                  {isConfigured ? 'Universal Intelligence Engine active' : 'Retrieval engine active'}
                </strong>
                <span id="bannerText">
                  {isConfigured
                    ? 'Full AI answers, conceptual synthesis, and multimodal reasoning are enabled.'
                    : 'Add your Gemini API key below to turn on full AI answers.'}
                </span>
              </div>
            </div>

            <section className="card">
              <div className="card-head">
                <div className="icon-box">
                  <svg viewBox="0 0 24 24">
                    <circle cx="8" cy="15" r="4" />
                    <path d="m10.8 12.2 9.2-9.2M16 7l3 3M14 9l2 2" />
                  </svg>
                </div>
                <div>
                  <h3>AI engine</h3>
                  <p>Powers cited answers, study material, and document comparison.</p>
                </div>
                <span className={`badge ${isConfigured ? 'on' : ''}`} id="badge">
                  <span className="dot"></span>
                  <span id="badgeText">
                    {isConfigured ? 'AI engine connected' : 'Key needed'}
                  </span>
                </span>
              </div>

              <div className="field">
                <label htmlFor="tier">Intelligence tier</label>
                <select
                  id="tier"
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                >
                  <option value="gemini-flash-latest">Universal Intelligence Engine (recommended)</option>
                  <option value="gemini-3.8-flash">High-Speed Reasoning Engine (gemini-3.8-flash)</option>
                  <option value="gemini-3.7-flash">Deep Analytical Engine (gemini-3.7-flash)</option>
                  <option value="gemini-pro-latest">Enterprise Research Engine (gemini-pro-latest)</option>
                </select>
                <p className="hint">Requests are routed automatically to the fastest available endpoint.</p>
              </div>

              <div className="note">
                <h4>Your data stays private</h4>
                <p>
                  API keys are encrypted and stored only on your backend. Documents and text vectors are processed in an isolated local index and are never shared or used to train models.
                </p>
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="key">Gemini API key</label>
                <div className="key-row">
                  <input
                    id="key"
                    type={showKey ? 'text' : 'password'}
                    placeholder={isConfigured ? '••••••••••••••••••••••••••••••••••••' : 'Paste your API key'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveKey();
                      }
                    }}
                    autoComplete="off"
                  />
                  <button
                    className="btn ghost"
                    type="button"
                    id="toggle"
                    onClick={handleToggleShow}
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                  <button
                    className="btn"
                    type="button"
                    id="save"
                    onClick={handleSaveKey}
                    disabled={savingKey}
                  >
                    {savingKey ? 'Validating...' : 'Save key'}
                  </button>
                </div>
                <p className={`msg ${msg.type}`} id="msg" role="status">
                  {msg.text}
                </p>
                <p className="hint">Keys are checked as soon as you save.</p>
              </div>
            </section>

            <section className="card">
              <div className="card-head" style={{ border: 0, margin: 0, paddingBottom: 18 }}>
                <div>
                  <h3>Storage &amp; engine stack</h3>
                </div>
              </div>
              <div className="stack">
                <div className="tile">
                  <div className="k">Relational storage</div>
                  <strong>Persistent relational store</strong>
                  <span>{status?.database_type || 'Document metadata and conversations'}</span>
                </div>
                <div className="tile">
                  <div className="k">Vector storage</div>
                  <strong>High-density vector index</strong>
                  <span>{status?.chunks_count ?? 0} indexed passages</span>
                </div>
                <div className="tile">
                  <div className="k">Embeddings</div>
                  <strong>1,536-D semantic embeddings</strong>
                  <span>{status?.embedding_provider || 'Cosine similarity space'}</span>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
