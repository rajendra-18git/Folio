'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  UploadCloud,
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  FileText,
  Network,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '@/lib/useScrollAnimation';

export function WorkflowShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const headerRef = useScrollReveal<HTMLDivElement>({ y: 50, duration: 0.9 });
  const stepsGridRef = useStaggerReveal<HTMLDivElement>('.workflow-step-card', {
    y: 40,
    stagger: 0.1,
    duration: 0.7,
  });
  const previewRef = useScrollReveal<HTMLDivElement>({ y: 60, duration: 1, delay: 0.2 });

  // Animate content change when step changes
  const narrativeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!narrativeRef.current) return;
    gsap.fromTo(
      narrativeRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, [activeStep]);

  const steps = [
    {
      step: '01',
      tag: 'INGEST',
      title: 'Upload Supported Documents',
      description:
        'Upload PDFs, textbooks, reports, and research papers. Text structures are extracted with 1-indexed boundaries and scanned OCR support.',
      icon: UploadCloud,
    },
    {
      step: '02',
      tag: 'RETRIEVE',
      title: 'Dense Vector Search',
      description:
        'Find semantically relevant passages using high-dimensional embeddings and cosine distance calculation in under 40ms.',
      icon: Search,
    },
    {
      step: '03',
      tag: 'UNDERSTAND',
      title: 'Grounded Model Synthesis',
      description:
        'Use configured AI models to answer complex conceptual questions strictly grounded in the retrieved evidence with zero hallucination.',
      icon: Sparkles,
    },
    {
      step: '04',
      tag: 'CONNECT',
      title: 'Cross-Document Relationships',
      description:
        'Compare information across documents, surface agreements, highlight contrasts, and pinpoint unanswered evidence gaps.',
      icon: Network,
    },
  ];

  return (
    <section
      id="workflows"
      className="relative py-28 border-t border-b border-[var(--color-border)] overflow-hidden transition-colors duration-300"
    >
      {/* Volumetric glow */}
      <div className="prism-glow w-[550px] h-[550px] -top-32 right-10 bg-[#38BDF8]/15" />
      <div className="prism-glow w-[450px] h-[450px] bottom-0 left-10 bg-[#0284C7]/15" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header — scroll reveal */}
        <div ref={headerRef} className="max-w-3xl mb-16 space-y-4 text-left">
          <span className="text-xs uppercase font-bold tracking-widest text-sky-700 dark:text-[#60D5FA] block font-mono">
            Product Architecture · End-to-End Grounding
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal font-absans tracking-[-0.03em] text-[var(--color-text-primary)] leading-[1.05]">
            Information is everywhere.{' '}
            <span className="prism-gradient-text block">Understanding is everything.</span>
          </h2>
          <p className="text-base text-[var(--color-text-secondary)] leading-relaxed font-normal font-absans">
            See how Folio ingests complex files, surfaces exact semantic evidence, and
            synthesizes answers with verifiable page references.
          </p>
        </div>

        {/* 4-Step Scrub Track — stagger reveal */}
        <div ref={stepsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isSelected = activeStep === index;
            return (
              <button
                key={item.step}
                onClick={() => setActiveStep(index)}
                className={`workflow-step-card p-5 rounded-2xl text-left transition-all duration-300 border cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#0B1936] border-sky-400 dark:border-[#60D5FA]/60 shadow-xl shadow-sky-200/50 dark:shadow-[#38BDF8]/25 ring-1 ring-sky-300 dark:ring-[#60D5FA]/30 scale-[1.01]'
                    : 'bg-white/60 dark:bg-[#060F22]/70 hover:bg-white dark:hover:bg-[#0B1936]/60 border-slate-200 dark:border-[#ADD8E6]/10 text-slate-600 dark:text-[#8BA8C8]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-mori font-semibold tracking-wider px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#0284C7] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#8BA8C8]'
                    }`}
                  >
                    0{index + 1} · {item.tag}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-sky-600 dark:text-[#60D5FA]' : 'text-slate-400 dark:text-[#8BA8C8]'
                    }`}
                  />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight font-absans">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#8BA8C8] line-clamp-2 leading-relaxed font-absans">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Product Preview — scroll reveal */}
        <div ref={previewRef} className="prism-glass rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative — animated on step change */}
            <div ref={narrativeRef} className="lg:col-span-5 space-y-5 text-left">
              <span className="text-xs font-mori font-semibold text-sky-700 dark:text-[#60D5FA] tracking-wider uppercase">
                Step 0{activeStep + 1} · {steps[activeStep].tag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-normal font-absans text-slate-900 dark:text-white tracking-tight">
                {steps[activeStep].title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-[#8BA8C8] leading-relaxed font-absans">
                {steps[activeStep].description}
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-[#ADD8E6]/15 text-xs space-y-2 font-mono text-slate-800 dark:text-[#FFFAFA]">
                <div className="text-emerald-600 dark:text-emerald-400">
                  ✓ Ingestion verified: 1-indexed page boundaries
                </div>
                <div className="text-sky-700 dark:text-[#60D5FA]">
                  ✓ Dense vector search: cos_sim &gt; 0.85
                </div>
                <div className="text-blue-700 dark:text-[#ADD8E6]">
                  ✓ Zero-hallucination constraint active
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/workspace"
                  className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-[#60D5FA] hover:text-sky-900 dark:hover:text-white transition"
                >
                  <span>Launch Interactive Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Product Interface Preview */}
            <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#060F22] border border-slate-200 dark:border-[#ADD8E6]/20 shadow-2xl overflow-hidden text-left">
              {/* Window Titlebar */}
              <div className="px-4 py-3 bg-slate-100/90 dark:bg-[#0B1936] border-b border-slate-200 dark:border-[#ADD8E6]/15 flex items-center justify-between text-xs text-slate-600 dark:text-[#8BA8C8]">
                <div className="flex items-center gap-2 font-mono">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="ml-2 text-slate-800 dark:text-white font-medium flex items-center gap-1.5 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-[#60D5FA]" />
                    Quantum_Attention_Architectures.pdf
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono border border-emerald-200 dark:border-emerald-500/30">
                  Indexed · 42 Chunks
                </span>
              </div>

              {/* Dual-Pane Interface */}
              <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-white/10 min-h-[340px]">
                {/* PDF Viewer Pane */}
                <div className="sm:col-span-6 p-4 bg-slate-50/90 dark:bg-[#040914]/90 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-[#8BA8C8] pb-2 border-b border-slate-200 dark:border-white/10 font-mono">
                    <span className="text-slate-900 dark:text-white font-semibold">Page 14 of 56</span>
                    <span className="text-sky-700 dark:text-[#60D5FA]">150 DPI Render</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-2 text-[11px] leading-relaxed text-slate-700 dark:text-[#8BA8C8]">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                      § 4.2 Linear Attention Complexity
                    </h5>
                    <p>
                      By decomposing the kernel matrix through randomized feature maps, the quadratic
                      complexity{' '}
                      <span className="font-mono text-sky-700 dark:text-[#60D5FA]">O(n² · d)</span> is
                      reduced to linear space{' '}
                      <span className="font-mono text-sky-700 dark:text-[#60D5FA]">O(n · d²)</span>.
                    </p>
                    <div className="p-2 rounded-lg bg-sky-50 dark:bg-[#0284C7]/20 border-l-2 border-sky-600 dark:border-[#60D5FA] text-sky-800 dark:text-[#60D5FA] text-[10px] italic">
                      &ldquo;Reduces memory footprint by 78% for context windows &gt; 32k tokens.&rdquo;
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 text-[10px] font-mono text-slate-600 dark:text-[#8BA8C8] flex justify-between">
                    <span>Chunk #24 · Offset: 3820-4620</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">cos_sim: 0.948</span>
                  </div>
                </div>

                {/* AI Answer Panel */}
                <div className="sm:col-span-6 p-4 bg-white/95 dark:bg-[#0B1936]/90 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div className="ml-auto p-2.5 rounded-xl bg-[#0284C7] text-white text-[11px] font-medium leading-relaxed max-w-[90%] shadow-md">
                      How does the paper reduce quadratic attention memory for 32k tokens?
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-[11px] leading-relaxed space-y-2">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-sky-700 dark:text-[#60D5FA]">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-sky-600 dark:text-[#60D5FA]" />
                          Grounded Answer
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                          0.0% Hallucination
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 text-xs">
                        The architecture decomposes the attention kernel via randomized feature
                        mappings, reducing space complexity from{' '}
                        <strong className="text-slate-900 dark:text-white">O(n²·d)</strong> to{' '}
                        <strong className="text-slate-900 dark:text-white">O(n·d²)</strong>, yielding
                        a 78% memory reduction for &gt;32k tokens.
                      </p>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 dark:bg-[#0284C7]/20 text-sky-800 dark:text-[#60D5FA] border border-sky-200 dark:border-[#60D5FA]/30 text-[10px] font-bold">
                          <BookOpen className="w-3 h-3" />
                          [Quantum_Attention.pdf · Page 14]
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Input Search Mockup */}
                  <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-[#8BA8C8]">
                    <span className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-[#8BA8C8]">
                      <Search className="w-3.5 h-3.5 text-sky-600 dark:text-[#60D5FA]" />
                      Ask anything grounded in this document...
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0284C7] text-[10px] text-white font-bold">
                      Send
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
