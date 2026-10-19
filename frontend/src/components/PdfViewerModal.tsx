'use client';

import React from 'react';
import { X, FileText, Download, ExternalLink } from 'lucide-react';
import { Citation } from '@/lib/types';
import { api } from '@/lib/api';

interface PdfViewerModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export function PdfViewerModal({ citation, onClose }: PdfViewerModalProps) {
  if (!citation) return null;

  const imageUrl = api.getPageImageUrl(citation.document_id, citation.page_number);
  const downloadUrl = api.getDocumentDownloadUrl(citation.document_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                {citation.document_name}
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                  Page {citation.page_number}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Grounding Evidence · Retrieval Score: {citation.score ? `${Math.round(citation.score * 100)}%` : 'Verified'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
              title="Download original PDF"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
          {/* Excerpt Details */}
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Supporting Citation Excerpt
              </span>
              <blockquote className="mt-2 text-sm text-slate-700 italic border-l-2 border-indigo-400 pl-3 leading-relaxed">
                &ldquo;{citation.excerpt}&rdquo;
              </blockquote>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Document ID:</span>
                <span className="font-mono text-slate-700">{citation.document_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Page Index:</span>
                <span className="font-semibold text-slate-800">{citation.page_number}</span>
              </div>
              {citation.chunk_index !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Chunk Offset:</span>
                  <span className="font-mono text-slate-700">#{citation.chunk_index}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rendered Page Image Preview */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100/70 border border-slate-200 min-h-[350px] overflow-hidden">
            <img
              src={imageUrl}
              alt={`Page ${citation.page_number} preview`}
              className="max-h-[480px] w-auto object-contain rounded-lg shadow-sm border border-slate-200/80 bg-white"
              onError={(e) => {
                // Fallback text if image preview cannot render
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
