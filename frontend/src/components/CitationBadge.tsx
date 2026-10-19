'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { Citation } from '@/lib/types';

interface CitationBadgeProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
}

export function CitationBadge({ citation, onClick }: CitationBadgeProps) {
  return (
    <button
      onClick={() => onClick(citation)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 shadow-2xs transition-all duration-150 cursor-pointer text-left group"
      title={`Click to view page ${citation.page_number} in ${citation.document_name}`}
    >
      <BookOpen className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-700 shrink-0" />
      <span className="truncate max-w-[140px] font-medium">{citation.document_name}</span>
      <span className="font-semibold px-1 py-0.2 bg-white/80 rounded text-[10px] text-indigo-800 border border-indigo-200/50">
        p.{citation.page_number}
      </span>
    </button>
  );
}
