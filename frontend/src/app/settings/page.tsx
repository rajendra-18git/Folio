'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SettingsStatus } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { FolioShell } from '@/components/FolioShell';

export default function SettingsPage() {
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-flash-latest');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' | '' }>({ text: '', type: '' });

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

  const isConfigured = Boolean(status?.gemini_configured);

  return (
    <FolioShell
      activeRoute="/settings"
      pageTitle="Document Intelligence & Study Assistant"
      onDocumentUploaded={fetchStatus}
    >
      <main className="content">
        <style jsx>{`
          .settings-wrap {
            max-width: 920px;
            width: 100%;
            margin: 0 auto;
          }
          .settings-head h1 {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #0e1530;
            font-family: 'Sora', sans-serif;
            margin: 0;
          }
          .settings-head .sub {
            color: #5b6478;
            font-size: 14px;
            margin: 6px 0 24px;
          }

          /* Banner */
          .banner {
            display: flex;
            align-items: center;
            gap: 14px;
            background: #0a2a66;
            color: #fff;
            border-radius: 14px;
            padding: 18px 22px;
            margin-bottom: 24px;
          }
          .banner .pulse {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #4ade80;
            box-shadow: 0 0 0 5px rgba(74, 222, 128, 0.25);
            flex-shrink: 0;
          }
          .banner strong {
            display: block;
            font-size: 15px;
            font-family: 'Sora', sans-serif;
          }
          .banner span {
            color: #bcd0f5;
            font-size: 13px;
          }

          /* Cards */
          .card {
            background: #fff;
            border: 1px solid #e3e8f3;
            border-radius: 16px;
            padding: 26px;
            margin-bottom: 22px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          }
          .card-head {
            display: flex;
            align-items: center;
            gap: 14px;
            padding-bottom: 18px;
            border-bottom: 1px solid #e3e8f3;
            margin-bottom: 22px;
          }
          .icon-box {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: #dbeafe;
            color: #1d4ed8;
            display: grid;
            place-items: center;
            flex-shrink: 0;
          }
          .icon-box svg {
            width: 22px;
            height: 22px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .card-head h3 {
            font-size: 17px;
            color: #0e1530;
            font-weight: 700;
            font-family: 'Sora', sans-serif;
            margin: 0;
          }
          .card-head p {
            color: #5b6478;
            font-size: 13px;
            margin: 2px 0 0;
          }
          .badge {
            margin-left: auto;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border-radius: 99px;
            padding: 6px 14px;
            font-weight: 600;
            font-size: 12px;
            white-space: nowrap;
            background: #fff7e0;
            color: #8a6100;
          }
          .badge.on {
            background: #e3f6f1;
            color: #0e7c66;
          }
          .badge .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
          }

          label {
            display: block;
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 8px;
            color: #0e1530;
          }
          select,
          input {
            width: 100%;
            height: 44px;
            border: 1px solid #e3e8f3;
            border-radius: 10px;
            padding: 0 14px;
            font-family: 'Figtree', sans-serif;
            font-size: 14px;
            color: #0e1530;
            background: #fff;
          }
          select:focus,
          input:focus {
            outline: 2px solid #2563eb;
            outline-offset: 1px;
          }
          .hint {
            font-size: 12px;
            color: #5b6478;
            margin-top: 8px;
          }
          .field {
            margin-bottom: 22px;
          }
          .note {
            background: #f4f7fc;
            border: 1px solid #e3e8f3;
            border-left: 4px solid #1d4ed8;
            border-radius: 10px;
            padding: 16px 18px;
            margin-bottom: 22px;
          }
          .note h4 {
            font-size: 14px;
            color: #0e1530;
            margin-bottom: 6px;
            font-weight: 700;
            font-family: 'Sora', sans-serif;
          }
          .note p {
            color: #5b6478;
            line-height: 1.55;
            font-size: 13px;
            margin: 0;
          }
          .key-row {
            display: flex;
            gap: 10px;
          }
          .btn-settings {
            height: 44px;
            padding: 0 22px;
            border: 0;
            border-radius: 10px;
            background: #1d4ed8;
            color: #fff;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-family: 'Figtree', sans-serif;
            transition: background 0.15s;
          }
          .btn-settings:hover {
            background: #1e40af;
          }
          .btn-settings.ghost {
            background: #fff;
            color: #1d4ed8;
            border: 1px solid #1d4ed8;
          }
          .btn-settings.ghost:hover {
            background: #dbeafe;
          }
          .btn-settings:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          .msg {
            font-size: 13px;
            margin-top: 10px;
            min-height: 18px;
            font-weight: 600;
          }
          .msg.ok {
            color: #0e7c66;
          }
          .msg.err {
            color: #b42318;
          }

          /* Stack tiles */
          .stack {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            width: 100%;
          }
          .stack-tile {
            width: 100% !important;
            height: auto !important;
            min-height: 110px;
            border: 1px solid #e3e8f3;
            border-radius: 12px;
            padding: 18px 20px;
            background: #f4f7fc;
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            gap: 4px;
            box-sizing: border-box;
          }
          .stack-tile .k {
            color: #1d4ed8;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 2px;
          }
          .stack-tile strong {
            display: block;
            color: #0e1530;
            font-size: 15px;
            font-weight: 700;
            font-family: 'Sora', sans-serif;
            line-height: 1.3;
            margin-bottom: 2px;
          }
          .stack-tile span {
            color: #5b6478;
            font-size: 12px;
            line-height: 1.45;
            word-break: break-word;
          }

          @media (max-width: 860px) {
            .stack {
              grid-template-columns: 1fr;
            }
            .key-row {
              flex-direction: column;
            }
            .card-head {
              flex-wrap: wrap;
            }
            .badge {
              margin-left: 0;
            }
          }
        `}</style>

        <div className="settings-wrap">
          <div className="settings-head">
            <h1>Settings</h1>
            <p className="sub">Manage your AI engine, API key, and storage.</p>
          </div>

          <div className="banner">
            <span className="pulse"></span>
            <div>
              <strong>
                {isConfigured ? 'Universal Intelligence Engine active' : 'Retrieval engine active'}
              </strong>
              <span>
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
              <span className={`badge ${isConfigured ? 'on' : ''}`}>
                <span className="dot"></span>
                <span>{isConfigured ? 'AI engine connected' : 'Key needed'}</span>
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
                  className="btn-settings ghost"
                  type="button"
                  onClick={handleToggleShow}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
                <button
                  className="btn-settings"
                  type="button"
                  onClick={handleSaveKey}
                  disabled={savingKey}
                >
                  {savingKey ? 'Validating...' : 'Save key'}
                </button>
              </div>
              <p className={`msg ${msg.type}`} role="status">
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
              <div className="stack-tile">
                <div className="k">Relational storage</div>
                <strong>Persistent relational store</strong>
                <span>{status?.database_type || 'Document metadata and conversations'}</span>
              </div>
              <div className="stack-tile">
                <div className="k">Vector storage</div>
                <strong>High-density vector index</strong>
                <span>{status?.chunks_count ?? 0} indexed passages</span>
              </div>
              <div className="stack-tile">
                <div className="k">Embeddings</div>
                <strong>1,536-D semantic embeddings</strong>
                <span>{status?.embedding_provider || 'Cosine similarity space'}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </FolioShell>
  );
}
