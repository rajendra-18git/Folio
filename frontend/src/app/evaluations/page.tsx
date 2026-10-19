'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import { api } from '@/lib/api';
import { EvaluationRun, TestCase, DocumentItem } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { FolioShell } from '@/components/FolioShell';

export default function EvaluationsPage() {
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [running, setRunning] = useState(false);
  const [runName, setRunName] = useState('Standard RAG Benchmark');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Test Case State
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [newPages, setNewPages] = useState('1');
  const [newKeywords, setNewKeywords] = useState('');

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const [r, tc, docs] = await Promise.all([
        api.listEvaluationRuns().catch(() => []),
        api.listTestCases().catch(() => []),
        api.listDocuments().catch(() => []),
      ]);
      setRuns(r);
      setTestCases(tc);
      setDocuments(docs);
      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].id);
      }
    } catch {
      showToast('Failed to load evaluation metrics.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunEvaluation = async () => {
    setRunning(true);
    showToast('Running evaluation benchmark suite...', 'info');
    try {
      const newRun = await api.runEvaluations(runName);
      setRuns((prev) => [newRun, ...prev]);
      showToast('Evaluation benchmark run complete!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Evaluation run failed.', 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleCreateTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      const pagesArr = newPages.split(',').map((p) => parseInt(p.trim())).filter((p) => !isNaN(p));
      const kwArr = newKeywords.split(',').map((k) => k.trim()).filter((k) => k.length > 0);
      const chosenDoc = documents.find((d) => d.id === selectedDocId);

      const tc = await api.createTestCase({
        question: newQuestion,
        expected_doc_id: selectedDocId || undefined,
        expected_doc_title: chosenDoc?.original_filename || undefined,
        expected_pages: pagesArr,
        expected_keywords: kwArr,
      });

      setTestCases((prev) => [...prev, tc]);
      setShowAddModal(false);
      setNewQuestion('');
      showToast('Test case registered!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create test case.', 'error');
    }
  };

  const latestRun = runs[0] || null;

  return (
    <FolioShell activeRoute="/evaluations" pageTitle="Evaluations" onDocumentUploaded={loadData}>
      <main className="content">
        <div className="page-head">
          <div>
            <h1>Evaluation dashboard</h1>
            <p>Algorithmic evaluation of citation validity, page accuracy, retrieval relevance and latency.</p>
          </div>
          <div className="row" style={{ gap: '12px' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setShowAddModal(true)}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1530" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Add test case</span>
            </button>
            <button
              type="button"
              className="btn-primary lg"
              onClick={handleRunEvaluation}
              disabled={running}
            >
              {running ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 4l13 8-13 8Z" />
                </svg>
              )}
              <span>{running ? 'Evaluating...' : 'Run evaluation'}</span>
            </button>
          </div>
        </div>

        {/* Latest Metrics Cards */}
        <section className="row" aria-label="Latest metrics">
          <div className="card stat">
            <div className="stat-col">
              <div className="stat-label">Citation validity</div>
              {latestRun ? (
                <div className="stat-value">{(latestRun.citation_validity_score * 100).toFixed(0)}%</div>
              ) : (
                <div className="stat-value empty">—</div>
              )}
            </div>
          </div>

          <div className="card stat">
            <div className="stat-col">
              <div className="stat-label">Page accuracy</div>
              {latestRun ? (
                <div className="stat-value">{(latestRun.page_validity_score * 100).toFixed(0)}%</div>
              ) : (
                <div className="stat-value empty">—</div>
              )}
            </div>
          </div>

          <div className="card stat">
            <div className="stat-col">
              <div className="stat-label">Retrieval relevance</div>
              {latestRun ? (
                <div className="stat-value">{(latestRun.retrieval_relevance_score * 100).toFixed(0)}%</div>
              ) : (
                <div className="stat-value empty">—</div>
              )}
            </div>
          </div>

          <div className="card stat">
            <div className="stat-col">
              <div className="stat-label">Latency</div>
              {latestRun ? (
                <div className="stat-value">{latestRun.avg_latency_ms.toFixed(0)} ms</div>
              ) : (
                <div className="stat-value empty">—</div>
              )}
            </div>
          </div>
        </section>

        {/* Empty State or Runs */}
        {runs.length === 0 ? (
          <section className="empty-state">
            <div className="tile">
              <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F5BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 20V10M12 20V4M19 20v-7" />
              </svg>
            </div>
            <strong>No evaluation runs yet</strong>
            <p>Choose Run evaluation to benchmark your ingested documents against your test cases.</p>
          </section>
        ) : (
          <section className="cases" style={{ marginTop: '20px' }}>
            <div className="cases-head">
              <h2>Evaluation runs <span>({runs.length})</span></h2>
            </div>
            {runs.slice(0, 5).map((run) => (
              <div key={run.id} className="case">
                <div>
                  <b>{run.name}</b>
                  <small>
                    {new Date(run.created_at).toLocaleString()} · {run.test_cases_count} test cases · {run.avg_latency_ms.toFixed(0)} ms
                  </small>
                </div>
                <span className="pill-blue">
                  {(run.page_validity_score * 100).toFixed(0)}% Page Accuracy
                </span>
              </div>
            ))}
          </section>
        )}

        {/* Test Cases */}
        <section className="cases">
          <div className="cases-head">
            <h2>Test cases <span>({testCases.length})</span></h2>
            <button type="button" onClick={() => setShowAddModal(true)}>
              + Add test case
            </button>
          </div>

          {testCases.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
              No test cases added yet. Click &apos;+ Add test case&apos; above to register your first verification query.
            </div>
          ) : (
            testCases.map((tc) => (
              <div key={tc.id} className="case">
                <div>
                  <b>{tc.question}</b>
                  <small>{tc.expected_doc_title || 'Any document'}</small>
                </div>
                <span className="pill-blue">
                  Expected pages: {tc.expected_pages && tc.expected_pages.length > 0 ? tc.expected_pages.join(', ') : 'Any'}
                </span>
              </div>
            ))
          )}
        </section>

        {/* Modal: Add Test Case */}
        {showAddModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(14,21,48,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '28px',
                maxWidth: '520px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(14,21,48,0.2)',
                border: '1px solid #E3E8F3',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0E1530' }}>
                  Register Ground Truth Test Case
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 0, cursor: 'pointer', color: '#5B6478' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTestCase} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="field">
                  <label style={{ fontSize: '14px', fontWeight: 700, color: '#0E1530' }}>
                    Evaluation Question / Query *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. What is quantum entanglement?"
                  />
                </div>

                <div className="field">
                  <label style={{ fontSize: '14px', fontWeight: 700, color: '#0E1530' }}>
                    Target Document
                  </label>
                  <select
                    className="input"
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                  >
                    <option value="">Any Document</option>
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.original_filename}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label style={{ fontSize: '14px', fontWeight: 700, color: '#0E1530' }}>
                    Expected Pages (comma-separated numbers)
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newPages}
                    onChange={(e) => setNewPages(e.target.value)}
                    placeholder="e.g. 1, 2"
                  />
                </div>

                <div className="field">
                  <label style={{ fontSize: '14px', fontWeight: 700, color: '#0E1530' }}>
                    Expected Ground Truth Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                    placeholder="e.g. qubit, superposition, entanglement"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Save Test Case
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </FolioShell>
  );
}
