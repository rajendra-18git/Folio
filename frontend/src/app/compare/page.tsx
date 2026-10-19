'use client';

import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Files,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Loader2,
  FileText
} from 'lucide-react';
import { api } from '@/lib/api';
import { DocumentItem, CompareResponse, Citation } from '@/lib/types';
import { PdfViewerModal } from '@/components/PdfViewerModal';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useToast } from '@/components/Toast';
import { FolioShell } from '@/components/FolioShell';

export default function ComparePage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [topicFocus, setTopicFocus] = useState<string>('');
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<CompareResponse | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const { showToast } = useToast();

  const loadDocuments = () => {
    api.listDocuments().then((docs) => {
      setDocuments(docs);
      if (docs.length >= 2 && selectedDocIds.length === 0) {
        setSelectedDocIds([docs[0].id, docs[1].id]);
      }
    });
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const toggleDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleRunComparison = async () => {
    if (selectedDocIds.length < 2) {
      showToast('Select at least 2 documents to compare.', 'error');
      return;
    }
    setComparing(true);
    showToast('Executing multi-step bounded comparison workflow...', 'info');

    try {
      const res = await api.compareDocuments(selectedDocIds, topicFocus);
      setComparisonResult(res);
      showToast('Comparative analysis completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Comparison failed.', 'error');
    } finally {
      setComparing(false);
    }
  };

  const report = comparisonResult?.report;

  return (
    <FolioShell activeRoute="/compare" pageTitle="Doc Comparison" onDocumentUploaded={loadDocuments}>
      <main className="content">
        <div className="page-head">
          <div>
            <h1>Document comparison</h1>
            <p>Synthesize and contrast multiple documents with a bounded research agent workflow.</p>
          </div>
        </div>

        <section className="box">
          <div className="form-stack" style={{ gap: '14px' }}>
            <div className="box-head">
              <strong>Select documents to compare <span>(minimum 2)</span></strong>
              <span className="count" id="cmpCount">
                {selectedDocIds.length} of {documents.length} selected
              </span>
            </div>

            {documents.length === 0 ? (
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  fontSize: '14px',
                }}
              >
                No documents found. Please upload at least 2 documents in the Document Library to enable cross-document comparison.
              </div>
            ) : (
              <div className="tiles">
                {documents.map((doc) => {
                  const isChecked = selectedDocIds.includes(doc.id);
                  return (
                    <label
                      key={doc.id}
                      className={`cmp ${isChecked ? 'on' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDoc(doc.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                      />
                      <span>
                        <b>{doc.original_filename}</b>
                        <small>{doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="topic" style={{ fontSize: '16px', fontWeight: 700, color: '#0E1530' }}>
              Focus topic <span style={{ fontWeight: 500, color: 'var(--muted)' }}>(optional)</span>
            </label>
            <input
              className="input"
              id="topic"
              type="text"
              value={topicFocus}
              onChange={(e) => setTopicFocus(e.target.value)}
              placeholder="e.g. Methodology differences, empirical performance, safety claims"
            />
          </div>

          <div className="run-row">
            <button
              type="button"
              className="btn-primary"
              id="runCompare"
              onClick={handleRunComparison}
              disabled={comparing || selectedDocIds.length < 2}
            >
              {comparing ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="7" height="16" rx="2" />
                  <rect x="14" y="4" width="7" height="16" rx="2" />
                </svg>
              )}
              <span>{comparing ? 'Synthesizing...' : 'Run comparison'}</span>
            </button>
          </div>
        </section>

        {/* Results Section */}
        {report ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
            {/* Executive Synthesis */}
            <div className="box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-deep)' }}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                    Executive Summary
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '2px 0 0' }}>
                    Multi-document bounded analysis across {selectedDocIds.length} sources
                  </p>
                </div>
              </div>

              <div style={{ color: 'var(--ink)', fontSize: '15px', lineHeight: 1.6 }}>
                <MarkdownRenderer content={report.executive_summary} />
              </div>
            </div>

            {/* Side-by-side Pillars: Similarities vs Differences */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Key Similarities */}
              <div className="box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '20px', height: '20px', color: 'var(--green)' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                    Key Similarities
                  </h4>
                </div>
                <div style={{ color: 'var(--text)', fontSize: '14px', lineHeight: 1.55 }}>
                  {Array.isArray(report.key_similarities) ? (
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {report.key_similarities.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <MarkdownRenderer content={String(report.key_similarities || '')} />
                  )}
                </div>
              </div>

              {/* Differences & Contradictions */}
              <div className="box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale style={{ width: '20px', height: '20px', color: 'var(--brand)' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                    Key Differences
                  </h4>
                </div>
                <div style={{ color: 'var(--text)', fontSize: '14px', lineHeight: 1.55 }}>
                  {Array.isArray(report.key_differences) ? (
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {report.key_differences.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <MarkdownRenderer content={String(report.key_differences || '')} />
                  )}
                </div>
              </div>
            </div>

            {/* Contradictions & Evidence Gaps */}
            {((report.contradictions && report.contradictions.length > 0) ||
              (report.evidence_gaps && report.evidence_gaps.length > 0)) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {report.contradictions && report.contradictions.length > 0 && (
                  <div className="box">
                    <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#DC2626' }}>
                      Contradictions
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: 'var(--text)' }}>
                      {report.contradictions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.evidence_gaps && report.evidence_gaps.length > 0 && (
                  <div className="box">
                    <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#D97706' }}>
                      Evidence Gaps
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: 'var(--text)' }}>
                      {report.evidence_gaps.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Citations Box */}
            {report.citations && report.citations.length > 0 && (
              <div className="box">
                <div className="cite-label">
                  Verified Cross-Document Citations ({report.citations.length})
                </div>
                <div className="cites">
                  {report.citations.map((c: Citation, i: number) => (
                    <button
                      key={i}
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
          </div>
        ) : (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
            <h2 className="section-title" style={{ fontSize: '20px' }}>What you will get</h2>
            <div className="tiles">
              <div className="mini"><b>Similarities</b><span>Ideas and claims the documents agree on.</span></div>
              <div className="mini"><b>Unique viewpoints</b><span>What only one of the documents argues.</span></div>
              <div className="mini"><b>Contradictions</b><span>Where the documents disagree.</span></div>
              <div className="mini"><b>Evidence gaps</b><span>Claims that need stronger support.</span></div>
            </div>
          </section>
        )}
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
