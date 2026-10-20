'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Eye,
  FileText,
  Table,
  BarChart,
  Layers,
  HelpCircle,
  Sparkles,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { api } from '@/lib/api';
import { DocumentItem, MultimodalAnalysisResponse } from '@/lib/types';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useToast } from '@/components/Toast';
import { FolioShell } from '@/components/FolioShell';

const ANALYSIS_MODES = [
  { id: 'general', name: 'Comprehensive Inspection', icon: Layers, desc: 'Overall visual layout, figures, and text' },
  { id: 'diagram', name: 'Diagram & Architecture', icon: Sparkles, desc: 'Schematics, flows, and relationships' },
  { id: 'table', name: 'Table Extraction', icon: Table, desc: 'Tabular structure and data trends' },
  { id: 'chart', name: 'Chart & Plot Interpretation', icon: BarChart, desc: 'Axes, data trends, and metrics' },
  { id: 'visual_qa', name: 'Visual Q&A', icon: HelpCircle, desc: 'Targeted question about visual elements' },
];

function MultimodalContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get('doc');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || '');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [analysisType, setAnalysisType] = useState<string>('general');
  const [question, setQuestion] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MultimodalAnalysisResponse | null>(null);
  const { showToast } = useToast();

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  useEffect(() => {
    api.listDocuments().then((docs) => {
      setDocuments(docs);
      if (!selectedDocId && docs.length > 0) {
        setSelectedDocId(docs[0].id);
      }
    });
  }, []);

  const handleAnalyze = async () => {
    if (!selectedDocId) {
      showToast('Please select a document.', 'error');
      return;
    }
    setAnalyzing(true);
    showToast('Rendering page image and running visual analysis...', 'info');

    try {
      const res = await api.analyzePage(
        selectedDocId,
        pageNumber,
        analysisType,
        question || undefined
      );
      setResult(res);
      if (res.is_configured) {
        showToast('Visual analysis completed!', 'success');
      } else {
        showToast('High-resolution page render ready.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Visual analysis failed.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (selectedDoc && pageNumber < selectedDoc.page_count) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Multimodal Visual Analysis</h2>
        <p className="text-sm text-slate-500">
          Analyze complex PDF diagrams, flowcharts, extracted tables, and visual charts directly from page renders.
        </p>
      </div>

      {/* Control Configuration Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Document</label>
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                setPageNumber(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {documents.length === 0 ? (
                <option value="">No documents available</option>
              ) : (
                documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.original_filename} ({d.page_count} pages)
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Page Selection (1 to {selectedDoc?.page_count || 1})
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={pageNumber <= 1}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                max={selectedDoc?.page_count || 1}
                value={pageNumber}
                onChange={(e) => setPageNumber(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
              />
              <button
                onClick={handleNextPage}
                disabled={!selectedDoc || pageNumber >= selectedDoc.page_count}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ANALYSIS_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = analysisType === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setAnalysisType(mode.id)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-2xs'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold leading-tight">{mode.name}</span>
              </button>
            );
          })}
        </div>

        {analysisType === 'visual_qa' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Visual Question
            </label>
            <input
              type="text"
              placeholder="e.g. What does the red trendline in figure 2 represent?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !selectedDocId}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 transition disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Page Image...</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Run Visual Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Output & Page Inspector */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rendered Page Image */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4 border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Rendered Page {result.page_number}
              </span>
              <span className="text-xs text-indigo-600 font-medium">150 DPI High-Resolution</span>
            </div>
            <div className="w-full bg-slate-50 p-2 rounded-2xl border border-slate-200/70 flex items-center justify-center min-h-[400px]">
              <img
                src={`${api.getBackendBaseUrl()}${result.image_preview_url}`}
                alt={`Page ${result.page_number} preview`}
                className="max-h-[550px] w-auto object-contain rounded-xl shadow-xs border border-slate-200 bg-white"
              />
            </div>
          </div>

          {/* Model Visual Analysis Results */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Visual Extraction Insights
                </span>
                <div className="flex items-center gap-2">
                  {result.is_configured ? (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Visual AI Engine
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      Visual Preview Ready
                    </span>
                  )}
                  {(result.tokens_used ?? 0) > 0 && (
                    <span className="text-xs text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      <Zap className="w-3 h-3 text-amber-600 fill-amber-500/20" />
                      {result.tokens_used?.toLocaleString()} tokens
                    </span>
                  )}
                  {(result.latency_ms ?? 0) > 0 && (
                    <span className="text-xs text-slate-400 font-medium">
                      {result.latency_ms?.toFixed(0)}ms
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-800 leading-relaxed">
                <MarkdownRenderer content={result.extracted_insights} className="text-xs" />
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500">
              💡 Visual analysis operates directly on rendered document page images without downsampling data columns or diagram labels.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MultimodalPage() {
  return (
    <FolioShell
      activeRoute="/multimodal"
      pageTitle="Document Intelligence & Study Assistant"
    >
      <main className="content">
        <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading visual tools...</div>}>
          <MultimodalContent />
        </React.Suspense>
      </main>
    </FolioShell>
  );
}
