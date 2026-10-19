'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Microscope,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  FileText,
  ShieldCheck
} from 'lucide-react';

export function UseCases() {
  const [activeTab, setActiveTab] = useState(0);

  const cases = [
    {
      id: 'students',
      label: 'Students',
      icon: GraduationCap,
      headline: 'Master 400-page syllabi without pulling all-nighters.',
      benefit: 'Generate structured 2-mark definitions, 5/10-mark essays, active-recall flashcards, and MCQ practice tests directly from class slides and textbooks.',
      features: [
        'Curriculum summaries with bullet key takeaways',
        'Auto-generated flashcards with difficulty ratings',
        'Diagnostic practice exams with section point breakdowns',
      ],
      previewSnippet: {
        title: 'Midterm Prep: Distributed Systems (CS 401)',
        highlight: 'Generated 14 active-recall flashcards & 3 mock exam essays.',
        citation: 'Tanenbaum_Distributed_Systems.pdf · Chapter 5 (Page 184)',
        badge: 'Exam Preparation Mode',
      },
    },
    {
      id: 'researchers',
      label: 'Researchers',
      icon: Microscope,
      headline: 'Synthesize literature & expose contradictions between papers.',
      benefit: 'Compare methodologies across 5 different studies. The bounded research agent maps agreements, contrasts, contradictions, and empirical data gaps automatically.',
      features: [
        'Side-by-side claims matrix (Agreement, Contrast, Contradiction)',
        'Evidence gap detection highlighting unanswered hypotheses',
        'Direct citation validation against original PDF chunks',
      ],
      previewSnippet: {
        title: 'Meta-Analysis: LLM Quantization Techniques',
        highlight: 'Contradiction detected in INT4 weight activation memory overhead.',
        citation: 'Dettmers_2022.pdf (p.4) vs Frantar_2023.pdf (p.9)',
        badge: 'Multi-Doc Research Mode',
      },
    },
    {
      id: 'professionals',
      label: 'Professionals',
      icon: Briefcase,
      headline: 'Auditing 60-page contracts shouldn’t take three days.',
      benefit: 'Instant clause lookup, termination condition inspection, and compliance verification with exact page and paragraph highlights.',
      features: [
        'Selective document querying across legal addendums',
        'Zero-hallucination guarantee ensures quotes are verbatim',
        '150 DPI page rendering for visual inspection of signature blocks',
      ],
      previewSnippet: {
        title: 'Master Service Agreement Review (MSA_v4.2)',
        highlight: 'Clause 14.3 Limitation of Liability capped at 12 months fees.',
        citation: 'Enterprise_MSA_Final.pdf · Page 38 (Section 14.3)',
        badge: 'Contract Intelligence',
      },
    },
    {
      id: 'businesses',
      label: 'Businesses',
      icon: Building2,
      headline: 'Turn sprawling SOPs into instant onboarding knowledge.',
      benefit: 'New team members ask questions and get answers grounded strictly in internal policy manuals, HR guidelines, and engineering handbooks.',
      features: [
        'Prompt injection guardrails isolate untrusted document data',
        'Persistent high-density vector store for sub-second internal indexing',
        'Clear verification badges indicate exactly which policy was cited',
      ],
      previewSnippet: {
        title: 'Engineering Onboarding & Incident Runbook',
        highlight: 'P0 incident escalation path identified for production outages.',
        citation: 'Infrastructure_SOP_2026.pdf · Page 12 (Runbook 3)',
        badge: 'Enterprise Knowledge Base',
      },
    },
  ];

  const current = cases[activeTab];
  const CurrentIcon = current.icon;

  return (
    <section id="use-cases" className="py-28 bg-[#040914] border-b border-[#ADD8E6]/10 relative overflow-hidden text-[#FFFAFA]">
      <div className="prism-glow w-[500px] h-[500px] -bottom-20 -right-20 bg-[#0284C7]/15" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-14 space-y-4 text-left">
          <span className="text-xs uppercase font-bold tracking-widest text-[#60D5FA] block font-mono">
            Targeted Intelligence
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal font-absans tracking-[-0.03em] text-[#FFFAFA] leading-[1.05]">
            Engineered for everyone{' '}
            <span className="prism-gradient-text block">
              who works with dense text.
            </span>
          </h2>
          <p className="text-base text-[#8BA8C8] leading-relaxed font-normal font-absans">
            Whether preparing for a medical board exam or auditing enterprise SLAs, DocuMind adapts to your workflow.
          </p>
        </div>

        {/* Persona Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-white/10">
          {cases.map((c, i) => {
            const Icon = c.icon;
            const isSelected = activeTab === i;
            return (
              <button
                key={c.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer font-absans ${
                  isSelected
                    ? 'bg-[#0B1936] text-white border border-[#60D5FA]/60 shadow-lg shadow-[#38BDF8]/25 ring-1 ring-[#60D5FA]/40 scale-105'
                    : 'bg-[#060F22]/80 text-[#8BA8C8] border border-[#ADD8E6]/10 hover:text-white hover:bg-[#0B1936]/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl prism-glass p-8 sm:p-12 border border-[#ADD8E6]/20">
          {/* Left Text Detail (6 cols) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1936] border border-[#ADD8E6]/20 text-[#60D5FA] text-xs font-bold font-mono">
              <CurrentIcon className="w-3.5 h-3.5" />
              <span>{current.label} Solution</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-normal font-absans text-white tracking-tight leading-snug">
              {current.headline}
            </h3>

            <p className="text-sm text-[#8BA8C8] leading-relaxed font-absans">
              {current.benefit}
            </p>

            <div className="space-y-2.5 pt-1">
              {current.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[#FFFAFA] font-absans">
                  <CheckCircle2 className="w-4 h-4 text-[#60D5FA] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white prism-blue-gradient shadow-lg shadow-[#38BDF8]/25 hover:scale-[1.02] transition"
              >
                <span>Launch {current.label} Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Miniature Realistic Interface Preview (6 cols) */}
          <div className="lg:col-span-6">
            <div className="p-6 rounded-2xl bg-[#060F22] border border-[#ADD8E6]/15 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between text-xs text-[#8BA8C8] pb-3 border-b border-white/10 font-mono">
                <span className="font-semibold text-white flex items-center gap-2 font-sans">
                  <FileText className="w-3.5 h-3.5 text-[#60D5FA]" />
                  {current.previewSnippet.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#0B1936] text-[#60D5FA] text-[10px] font-mono border border-[#ADD8E6]/20">
                  {current.previewSnippet.badge}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-[#8BA8C8]">Synthesized Finding</span>
                <p className="text-white font-semibold text-xs leading-relaxed font-absans">
                  {current.previewSnippet.highlight}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[#60D5FA] text-[11px] font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{current.previewSnippet.citation}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Verified Page Excerpt
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Match: High Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
