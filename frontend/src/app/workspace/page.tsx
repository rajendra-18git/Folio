'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Loader2,
  Trash2,
  Copy,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';
import { DocumentItem, Conversation, ChatMessage, Citation } from '@/lib/types';
import { PdfViewerModal } from '@/components/PdfViewerModal';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useToast } from '@/components/Toast';
import { FolioShell } from '@/components/FolioShell';

const SAMPLE_STARTERS = [
  'What is quantum computing?',
  'List some of the query requirements',
  'What SQL commands are used?',
  'Explain SELECT query',
  'What is SQL?',
  'What are the core conclusions?',
];

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get('doc');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(initialDocId ? [initialDocId] : []);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const loadDocsAndSettings = async () => {
    try {
      const [docs, setts] = await Promise.all([
        api.listDocuments().catch(() => []),
        api.getSettingsStatus().catch(() => null),
      ]);
      setDocuments(docs);
      setIsConfigured(setts?.gemini_configured ?? false);
      if (initialDocId && !selectedDocIds.includes(initialDocId)) {
        setSelectedDocIds([initialDocId]);
      } else if (selectedDocIds.length === 0 && docs.length > 0) {
        setSelectedDocIds([docs[0].id]);
      }
    } catch {
      // fallback
    }
  };

  const loadConversations = async () => {
    try {
      const convs = await api.listConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
        setMessages(convs[0].messages || []);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadDocsAndSettings();
    loadConversations();
  }, [initialDocId]);

  useEffect(() => {
    if (activeConversationId) {
      api.getConversation(activeConversationId)
        .then((c) => setMessages(c.messages || []))
        .catch(() => {});
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, sending]);

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleSelectAllDocs = () => {
    if (selectedDocIds.length === documents.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(documents.map((d) => d.id));
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || inputQuery;
    if (!query.trim() || sending) return;

    const userTempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: query,
      citations: [],
      is_demo_mode: false,
      latency_ms: 0,
      tokens_used: 0,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userTempMessage]);
    setInputQuery('');
    setSending(true);

    try {
      const response = await api.sendMessage(
        query,
        selectedDocIds,
        activeConversationId || undefined
      );

      setActiveConversationId(response.conversation_id);
      setMessages((prev) => [...prev, response.message]);
      api.listConversations().then(setConversations);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate answer.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        handleStartNewChat();
      }
      showToast('Conversation deleted.', 'info');
    } catch {
      showToast('Could not delete conversation.', 'error');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied answer to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentTitle = (() => {
    if (activeConversationId) {
      const active = conversations.find((c) => c.id === activeConversationId);
      if (active?.title) return active.title;
    }
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) return lastUser.content;
    return 'What is quantum computing?';
  })();

  return (
    <FolioShell activeRoute="/workspace" pageTitle="AI Workspace" onDocumentUploaded={loadDocsAndSettings}>
      <main className="ws">
        {/* Left Side: New discussion, Target Sources, History */}
        <div className="ws-side">
          <button type="button" className="btn-primary lg" onClick={handleStartNewChat}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>New discussion</span>
          </button>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Target sources</div>
              <button
                type="button"
                onClick={toggleSelectAllDocs}
                style={{
                  background: 'none',
                  border: 0,
                  color: 'var(--brand-deep)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {selectedDocIds.length === documents.length ? 'Deselect all' : 'All documents'}
              </button>
            </div>
            <div id="sourceList">
              {documents.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--muted)', padding: '6px 0' }}>
                  No documents indexed yet.
                </div>
              ) : (
                documents.map((doc) => {
                  const isChecked = selectedDocIds.includes(doc.id);
                  return (
                    <label key={doc.id} className="src">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectDoc(doc.id)}
                      />
                      <span>{doc.original_filename}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="panel grow">
            <div className="panel-title">History</div>
            <div id="historyList" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {conversations.length > 0 ? (
                conversations.map((c) => {
                  const isCurrent = activeConversationId === c.id;
                  return (
                    <div
                      key={c.id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}
                    >
                      <button
                        type="button"
                        className={`hi ${isCurrent ? 'on' : ''}`}
                        onClick={() => {
                          setActiveConversationId(c.id);
                          setMessages(c.messages || []);
                        }}
                      >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V5Z" />
                        </svg>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.title || 'Untitled conversation'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(c.id, e)}
                        title="Delete conversation"
                        style={{
                          background: 'none',
                          border: 0,
                          color: 'var(--muted)',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '6px',
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 hover:text-red-600 transition" />
                      </button>
                    </div>
                  );
                })
              ) : (
                SAMPLE_STARTERS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="hi"
                    onClick={() => handleSendMessage(undefined, s)}
                  >
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V5Z" />
                    </svg>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Chat */}
        <section className="chat" aria-label="Chat">
          <div className="chat-head">
            <h2 id="chatTitle">{currentTitle}</h2>
            <span id="sourceCount">
              {selectedDocIds.length} {selectedDocIds.length === 1 ? 'source' : 'sources'} selected
            </span>
          </div>

          <div className="chat-body">
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '480px', padding: '32px 0' }}>
                <svg role="img" aria-label="Folio" width="56" height="56" viewBox="0 0 120 120" style={{ margin: '0 auto 16px' }}>
                  <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" fill="#2F5BFF" />
                  <path d="M72 8V38H102Z" fill="#1C3FCF" />
                  <rect x="38" y="48" width="12" height="50" rx="3" fill="#fff" />
                  <rect x="38" y="48" width="38" height="12" rx="3" fill="#fff" />
                  <rect x="38" y="70" width="26" height="11" rx="3" fill="#fff" />
                </svg>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                  Ask questions with zero hallucinations
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Every answer is mathematically extracted and cross-referenced with your uploaded PDFs.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  {SAMPLE_STARTERS.slice(0, 3).map((starter, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(undefined, starter)}
                      className="sb"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: '#fff',
                        border: '1px solid var(--line)',
                        fontSize: '13.5px',
                        color: 'var(--ink)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{starter}</span>
                      <span style={{ color: 'var(--brand)', fontWeight: 600 }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                if (msg.role === 'user') {
                  return (
                    <div key={msg.id || index} className="msg-user">
                      {msg.content}
                    </div>
                  );
                }

                return (
                  <div key={msg.id || index} className="msg-bot">
                    <svg role="img" aria-label="Folio" width="34" height="34" viewBox="0 0 120 120">
                      <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" fill="#2F5BFF" />
                      <path d="M72 8V38H102Z" fill="#1C3FCF" />
                      <rect x="38" y="48" width="12" height="50" rx="3" fill="#fff" />
                      <rect x="38" y="48" width="38" height="12" rx="3" fill="#fff" />
                      <rect x="38" y="70" width="26" height="11" rx="3" fill="#fff" />
                    </svg>

                    <div className="msg-bot-body">
                      <h3>Retrieved grounded passages</h3>

                      {/* Cited passages preview */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {msg.citations.slice(0, 2).map((cit, ci) => (
                            <div key={ci}>
                              <div className="passage-meta">
                                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F5BFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M6 3h8l4 4v14H6Z" />
                                  <path d="M14 3v4h4" />
                                </svg>
                                <span>{cit.document_name || 'Document'}</span>
                                <em>Page {cit.page_number}</em>
                              </div>
                              <p className="passage">
                                &ldquo;{cit.excerpt || 'Passage extracted from verified document chunk.'}&rdquo;
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Main Synthesized Markdown Response */}
                      <div style={{ fontSize: '15px', color: 'var(--ink)', lineHeight: 1.6 }}>
                        <MarkdownRenderer content={msg.content} />
                      </div>

                      {/* Demo Mode Notice */}
                      {(!isConfigured || msg.is_demo_mode) && (
                        <div className="notice">
                          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C3FCF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '1px' }}>
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 11v5M12 8h.01" />
                          </svg>
                          <span>
                            Add your Gemini API key in <Link href="/settings" style={{ textDecoration: 'underline', fontWeight: 600 }}>Settings</Link> to get full generative synthesis, reasoning, and multi-document answers.
                          </span>
                        </div>
                      )}

                      {/* Citations list */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div>
                          <div className="cite-label">Verified citations ({msg.citations.length})</div>
                          <div className="cites">
                            {msg.citations.map((c, ci) => (
                              <button
                                key={ci}
                                type="button"
                                className="cite"
                                onClick={() => setActiveCitation(c)}
                              >
                                <span>{c.document_name || 'Document'}</span>
                                <b>p.{c.page_number}</b>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata bar */}
                      <div className="msg-meta">
                        <div className="left">
                          <span className="ok">
                            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B6B43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6Z" />
                              <path d="M9 12l2.2 2.2L15.5 10" />
                            </svg>
                            Extracted grounding
                          </span>
                          {msg.latency_ms > 0 && <span>{msg.latency_ms.toFixed(0)} ms</span>}
                          {msg.tokens_used != null && msg.tokens_used > 0 && <span>{msg.tokens_used} tokens</span>}
                        </div>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                        >
                          {copiedId === msg.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3A4258" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="8" y="8" width="12" height="12" rx="2" />
                                <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                              </svg>
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {sending && (
              <div className="msg-bot">
                <svg role="img" aria-label="Folio" width="34" height="34" viewBox="0 0 120 120">
                  <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" fill="#2F5BFF" />
                  <path d="M72 8V38H102Z" fill="#1C3FCF" />
                  <rect x="38" y="48" width="12" height="50" rx="3" fill="#fff" />
                  <rect x="38" y="48" width="38" height="12" rx="3" fill="#fff" />
                  <rect x="38" y="70" width="26" height="11" rx="3" fill="#fff" />
                </svg>
                <div className="msg-bot-body" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    Searching vector index and extracting grounded evidence...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              className="input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              aria-label="Ask a question about your uploaded documents"
              placeholder="Ask a question about your uploaded documents"
              disabled={sending}
            />
            <button
              type="submit"
              className="send"
              aria-label="Send question"
              disabled={sending || !inputQuery.trim()}
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              )}
            </button>
          </form>
        </section>
      </main>

      {/* PDF Modal */}
      {activeCitation && (
        <PdfViewerModal
          citation={activeCitation}
          onClose={() => setActiveCitation(null)}
        />
      )}
    </FolioShell>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
