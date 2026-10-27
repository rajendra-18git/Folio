'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareText,
  GraduationCap,
  Eye,
  GitCompare,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { TiltCard } from './TiltCard';
import { useScrollReveal } from '@/lib/useScrollAnimation';

export function FeatureStorytelling() {
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [selectedMCQ, setSelectedMCQ] = useState<number | null>(0);

  // Scroll reveal refs for each feature block
  const featureACopyRef = useScrollReveal<HTMLDivElement>({ x: -60, y: 0, duration: 1 });
  const featureACardRef = useScrollReveal<HTMLDivElement>({ x: 60, y: 0, duration: 1, delay: 0.15 });

  const featureBCopyRef = useScrollReveal<HTMLDivElement>({ x: 60, y: 0, duration: 1 });
  const featureBCardRef = useScrollReveal<HTMLDivElement>({ x: -60, y: 0, duration: 1, delay: 0.15 });

  const featureCCopyRef = useScrollReveal<HTMLDivElement>({ x: -60, y: 0, duration: 1 });
  const featureCCardRef = useScrollReveal<HTMLDivElement>({ x: 60, y: 0, duration: 1, delay: 0.15 });

  const featureDCopyRef = useScrollReveal<HTMLDivElement>({ x: 60, y: 0, duration: 1 });
  const featureDCardRef = useScrollReveal<HTMLDivElement>({ x: -60, y: 0, duration: 1, delay: 0.15 });

  return (
    <section id="features" className="relative space-y-0 bg-[var(--background)] transition-colors duration-300">
      {/* =========================================================================
          FEATURE A — Chat with Documents
         ========================================================================= */}
      <div className="py-28 bg-transparent border-b border-[var(--color-border)] overflow-hidden relative transition-colors duration-300">
        <div className="prism-glow w-[500px] h-[500px] top-10 -left-20 bg-[#38BDF8]/20" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Copy */}
            <div ref={featureACopyRef} className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <MessageSquareText className="w-3.5 h-3.5" />
                Feature A · Conversational RAG
              </div>
              <h2 className="text-3xl sm:text-5xl font-normal font-absans text-[var(--color-text-primary)] tracking-[-0.03em] leading-[1.05]">
                Ask anything.{' '}
                <span className="prism-gradient-text block">
                  Find the answer inside your files.
                </span>
              </h2>
              <p className="text-base text-[var(--color-text-secondary)] leading-relaxed font-normal font-absans">
                No keyword hunting through 300-page textbooks. Ask conceptual questions and receive
                synthesis grounded strictly in verified passages, complete with exact clickable page
                badges.
              </p>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Prompt injection guardrails treat all document text as untrusted data.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                  <span>Selective source filtering: query 1 document or all uploaded files simultaneously.</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href="/workspace"
                  className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-800 transition"
                >
                  <span>Explore Grounded Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Preview Card */}
            <div ref={featureACardRef} className="lg:col-span-7">
              <TiltCard maxTilt={5} glare={false}>
                <div className="rounded-3xl prism-glass p-6 sm:p-8 space-y-4 text-left border border-slate-200 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Active Discussion: Neural Architectures
                    </span>
                    <span className="font-mono text-[11px] text-sky-600 font-medium">3 Sources Filtered</span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-2xl bg-[#0284C7] text-white text-xs font-medium ml-auto max-w-[85%] leading-relaxed shadow-lg shadow-[#0284C7]/25">
                      What is the primary computational bottleneck when scaling self-attention to long sequences?
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs text-slate-800 space-y-3 leading-relaxed">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-sky-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                          Grounded Answer
                        </span>
                        <span className="text-[10px] text-emerald-600 font-mono font-medium">42ms · Zero Hallucination</span>
                      </div>

                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        <strong className="text-slate-900 font-bold">Quadratic Complexity:</strong> Standard self-attention scales with <span className="font-mono text-sky-700 font-semibold">O(n² · d)</span> complexity, where <span className="font-mono text-sky-700 font-semibold">n</span> is sequence length. Computing and storing the full <span className="font-mono text-sky-700 font-semibold">n × n</span> attention matrix becomes memory-prohibitive for context windows exceeding 8,192 tokens.
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                          <BookOpen className="w-3 h-3 text-sky-600" />
                          Attention_Limits.pdf · Page 8
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                          <BookOpen className="w-3 h-3 text-slate-600" />
                          Transformer_Scaling.pdf · Page 14
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FEATURE B — Smart Study Mode
         ========================================================================= */}
      <div className="py-28 bg-white/60 border-b border-[var(--color-border)] overflow-hidden relative transition-colors duration-300">
        <div className="prism-glow w-[550px] h-[550px] top-20 right-0 bg-[#0284C7]/15" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Interactive Preview Cards */}
            <div ref={featureBCardRef} className="lg:col-span-7 order-2 lg:order-1 space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Interactive Flashcard */}
                <div
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-lg cursor-pointer transition-all duration-300 hover:border-sky-400 group relative min-h-[190px] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-sky-700">
                    <span>Active Recall Flashcard</span>
                    <span className="flex items-center gap-1 text-slate-500 group-hover:text-sky-600 transition">
                      <RefreshCw className="w-3 h-3" />
                      Click to Flip
                    </span>
                  </div>

                  {!flashcardFlipped ? (
                    <div className="my-auto space-y-1.5">
                      <span className="text-[10px] text-sky-700 font-mono font-semibold">QUESTION (Medium)</span>
                      <p className="text-sm font-bold text-slate-900 leading-snug font-absans">
                        What is the mathematical role of dividing by √d_k in scaled dot-product attention?
                      </p>
                    </div>
                  ) : (
                    <div className="my-auto space-y-1.5 animate-in fade-in duration-200">
                      <span className="text-[10px] text-emerald-600 font-mono font-bold">ANSWER &amp; EVIDENCE</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-absans">
                        <strong className="text-slate-900">Prevents Vanishing Gradients:</strong> For large <span className="font-mono text-sky-700">d_k</span>, dot products grow large in magnitude, pushing softmax into regions with extremely small gradients.
                      </p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
                    Page 4 · Attention_Mechanics.pdf
                  </div>
                </div>

                {/* 2-Mark Exam Definition */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-lg space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-sky-700">
                    <span>2-Mark Exam Definition</span>
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-mono font-bold border border-sky-200">2 Marks</span>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-bold text-slate-900 font-absans">Define Multi-Head Self-Attention.</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-absans">
                      <strong className="text-slate-900">Definition:</strong> An architectural mechanism that linearly projects queries, keys, and values into multiple representation subspaces, running scaled dot-product attention in parallel.
                    </p>
                  </div>
                  <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Graded Key Points Included</span>
                  </div>
                </div>
              </div>

              {/* MCQ Element */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-lg space-y-3">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-sky-700">
                  <span>Diagnostic Practice Quiz (Question 1 of 5)</span>
                  <span className="text-slate-500 font-mono">Page Reference: Page 5</span>
                </div>
                <p className="text-xs font-bold text-slate-900 font-absans">
                  Why do self-attention layers allow for more parallelization compared to recurrent layers?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'A) Operations are computed independently across sequence positions without sequential time dependency',
                    'B) Recurrent networks do not utilize matrix multiplication operations',
                  ].map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedMCQ(idx)}
                      className={`p-2.5 rounded-xl text-left text-[11px] transition border cursor-pointer ${
                        selectedMCQ === idx
                          ? 'bg-emerald-50 border-emerald-500/50 text-emerald-800'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {selectedMCQ === 0 && (
                  <p className="text-[10px] text-emerald-600 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Correct. Recurrent models require step t-1 before computing step t. Attention computes all positions simultaneously.</span>
                  </p>
                )}
              </div>
            </div>

            {/* Copy */}
            <div ref={featureBCopyRef} className="lg:col-span-5 order-1 lg:order-2 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" />
                Feature B · Smart Study Mode
              </div>
              <h2 className="text-3xl sm:text-5xl font-normal font-absans text-[var(--color-text-primary)] tracking-[-0.03em] leading-[1.05]">
                From textbook pages{' '}
                <span className="prism-gradient-text block">to exam-ready notes.</span>
              </h2>
              <p className="text-base text-[var(--color-text-secondary)] leading-relaxed font-normal font-absans">
                Prepare for exams in half the time. Folio breaks dense academic prose into verified 2-mark definitions, 5-mark and 10-mark essays, active-recall flashcards, and MCQ practice tests with cited explanations.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                  <span>Executive Summaries with crisp takeaway bullet points</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                  <span>Timed Diagnostic Practice Exams with section breakdown</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href="/study"
                  className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-800 transition"
                >
                  <span>Launch Study Assistant</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FEATURE C — Multimodal Understanding
         ========================================================================= */}
      <div className="py-28 bg-transparent border-b border-[var(--color-border)] overflow-hidden relative transition-colors duration-300">
        <div className="prism-glow w-[550px] h-[550px] top-10 left-10 bg-[#60D5FA]/15" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Copy */}
            <div ref={featureCCopyRef} className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                Feature C · Multimodal Vision
              </div>
              <h2 className="text-3xl sm:text-5xl font-normal font-absans text-[var(--color-text-primary)] tracking-[-0.03em] leading-[1.05]">
                Go beyond text.{' '}
                <span className="prism-gradient-text block">Read every diagram and chart.</span>
              </h2>
              <p className="text-base text-[var(--color-text-secondary)] leading-relaxed font-normal font-absans">
                Documents are visual. Folio renders page images at 150 DPI and invokes neural visual reasoning to inspect complex system flowcharts, architecture diagrams, numerical plots, and embedded tables.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-800">
                <p className="font-bold text-slate-900 font-absans">Full Diagram Breakdown:</p>
                <p className="text-[11px] text-slate-600 font-absans">
                  Extracts node relationships, dataflows, numerical axis points, and trends from images that traditional text extractors miss.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/multimodal"
                  className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-800 transition"
                >
                  <span>Inspect Visual Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Preview Card */}
            <div ref={featureCCardRef} className="lg:col-span-7">
              <TiltCard maxTilt={5} glare={false}>
                <div className="rounded-3xl prism-glass p-6 sm:p-8 space-y-4 text-left border border-slate-200 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-sky-600" />
                      Multimodal Page Vision: Transformer Architecture
                    </span>
                    <span className="font-mono text-sky-700 text-[11px] font-semibold">150 DPI Image Render</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-col justify-between space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Detected Schematic (Figure 1)</span>
                      <div className="py-6 px-3 rounded-lg bg-sky-50/70 border border-sky-200 text-center space-y-2">
                        <div className="inline-block px-3 py-1 rounded bg-[#0284C7] text-white font-mono text-[11px] font-bold shadow-md">
                          Feed Forward [Nx]
                        </div>
                        <div className="text-[10px] text-sky-700 font-bold">&uarr; Add &amp; Norm &uarr;</div>
                        <div className="inline-block px-3 py-1 rounded bg-[#0369A1] text-white font-mono text-[11px] font-bold shadow-md">
                          Multi-Head Attention
                        </div>
                        <div className="text-[10px] text-sky-700 font-bold">&uarr; Positional Encoding &uarr;</div>
                        <div className="inline-block px-3 py-1 rounded bg-white text-slate-700 font-mono text-[10px] border border-slate-200">
                          Input Embeddings
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Page 3 of Attention_Deep_Dive.pdf</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-sky-700">Visual Intelligence Breakdown</span>
                      <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed font-absans">
                        <p>
                          <strong className="text-slate-900">Encoder Stack:</strong> 6 identical layers, each with two sub-layers: multi-head self-attention and position-wise feed-forward network.
                        </p>
                        <p>
                          <strong className="text-slate-900">Residual Connections:</strong> Residual connections surround each sub-layer, followed by layer normalization.
                        </p>
                        <p>
                          <strong className="text-slate-900">Positional Encodings:</strong> Sine and cosine frequencies allow the model to learn relative sequence positions.
                        </p>
                      </div>
                      <div className="pt-1 text-[10px] text-emerald-600 font-mono font-medium">
                        ✓ Verified from visual schematic geometry
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FEATURE D — Research and Compare
         ========================================================================= */}
      <div className="py-28 bg-white/60 border-b border-[var(--color-border)] overflow-hidden relative transition-colors duration-300">
        <div className="prism-glow w-[550px] h-[550px] top-10 right-10 bg-[#38BDF8]/15" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Claims Matrix Preview */}
            <div ref={featureDCardRef} className="lg:col-span-7 order-2 lg:order-1">
              <TiltCard maxTilt={5} glare={false}>
                <div className="rounded-3xl prism-glass p-6 sm:p-8 space-y-4 text-left border border-slate-200 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900 flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-sky-600" />
                      Comparative Claims Matrix
                    </span>
                    <span className="text-[11px] text-sky-700 font-mono font-semibold">2 Documents Evaluated</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        topic: 'Training Scalability',
                        docA: 'Document A (2017): Replaces recurrence with parallel matrix computations, enabling faster training across GPUs.',
                        docB: 'Document B (2023): Demonstrates linear attention variants to reduce quadratic memory limits.',
                        status: 'Agreement',
                        statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
                      },
                      {
                        topic: 'Context Window Limits',
                        docA: 'Document A: Evaluated on fixed sequence lengths of 512 tokens.',
                        docB: 'Document B: Emphasizes rotary position embeddings (RoPE) for context up to 128k tokens.',
                        status: 'Contrast',
                        statusColor: 'bg-amber-50 text-amber-700 border-amber-300',
                      },
                      {
                        topic: 'Inference Memory Footprint',
                        docA: 'Document A: Standard KV caching without memory compression.',
                        docB: 'Document B: Proposes multi-query (MQA) compression to reduce memory footprint.',
                        status: 'Contradiction',
                        statusColor: 'bg-rose-50 text-rose-700 border-rose-300',
                      },
                    ].map((row, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-[12px] font-absans">{row.topic}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 leading-relaxed font-absans">
                          <p className="border-l-2 border-sky-500 pl-2">{row.docA}</p>
                          <p className="border-l-2 border-sky-400 pl-2">{row.docB}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Copy */}
            <div ref={featureDCopyRef} className="lg:col-span-5 order-1 lg:order-2 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <GitCompare className="w-3.5 h-3.5" />
                Feature D · Bounded Comparison
              </div>
              <h2 className="text-3xl sm:text-5xl font-normal font-absans text-[var(--color-text-primary)] tracking-[-0.03em] leading-[1.05]">
                Connect the dots{' '}
                <span className="prism-gradient-text block">across multiple documents.</span>
              </h2>
              <p className="text-base text-[var(--color-text-secondary)] leading-relaxed font-normal font-absans">
                Compare conflicting research papers, revised contracts, or multiple textbook editions. Folio executes a bounded agent workflow to classify agreements, contrasts, contradictions, and evidence gaps.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                  <span>Claims Matrix categorizes Agreement, Contrast, and Contradictions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                  <span>Pinpoints evidence gaps where data is missing in both sources</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-800 transition"
                >
                  <span>Launch Document Comparison</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
