'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  MessageSquareText,
  Sparkles,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { setStoryStep } from './PersistentCanvas3D';

interface StepData {
  number: string;
  stepId: number;
  badge: string;
  title: string;
  description: string;
  tech: string;
  metrics: string;
  icon: React.ElementType;
}

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  const steps: StepData[] = [
    {
      number: '01',
      stepId: 1,
      badge: 'INGEST & SNAP',
      title: 'Upload your documents',
      description:
        'Upload your syllabus, research PDFs, contracts, or textbooks. Text is extracted while preserving 1-indexed page boundaries and detecting scanned pages for OCR. Documents fly in and snap into an indexed stack.',
      tech: 'Sentence-aware Sliding Window · 800 Chars · %PDF- Magic Bytes',
      metrics: 'Ingestion: < 800ms · 100% Text Density',
      icon: UploadCloud,
    },
    {
      number: '02',
      stepId: 2,
      badge: 'CHUNK & VECTORIZE',
      title: 'Ask in your own words',
      description:
        'Ask conceptual or specific questions in natural English. The document stack decomposes into semantic text chunks that transform into high-dimensional vector nodes projected into embedding space.',
      tech: 'Dense 1,536-D Vector Projections · Real-Time Index',
      metrics: 'Embedding Latency: 12ms · Dense Representation',
      icon: MessageSquareText,
    },
    {
      number: '03',
      stepId: 3,
      badge: 'COSINE INTERSECTION',
      title: 'Grounded model synthesis',
      description:
        'A query ray shoots through the point cloud and the nearest semantic nodes light up via cosine distance calculation. AI synthesizes grounded answers using only the retrieved passages with zero hallucination.',
      tech: 'Cosine Distance Metric · Top-K Retrieval · Zero-Hallucination Guard',
      metrics: 'Cosine Sim: 0.962 · Retrieval: 38ms',
      icon: Sparkles,
    },
    {
      number: '04',
      stepId: 4,
      badge: 'VISUAL PAGE PROOF',
      title: 'Explore answers backed by sources',
      description:
        'The camera pushes directly into the cited node, opening into the verified page with highlighted source passages. Every claim features exact page citations backed by rendered 150 DPI visual proofs.',
      tech: '150 DPI Visual Page Rendering · Exact Page Badges · Verified Page Proof',
      metrics: 'Page Proof: Page 14 · Zero Fabrications',
      icon: FileCheck2,
    },
  ];

  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
    setStoryStep(stepId);
  };

  const activeStepRef = useRef(activeStep);
  activeStepRef.current = activeStep;

  // Scroll listener to update active step based on scroll position within section
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.top <= viewportHeight * 0.5 && rect.bottom >= viewportHeight * 0.2) {
        const progress = Math.min(
          1,
          Math.max(0, (viewportHeight * 0.5 - rect.top) / (rect.height - viewportHeight * 0.3))
        );
        const calculatedStep = Math.min(4, Math.max(1, Math.floor(progress * 4) + 1));
        if (calculatedStep !== activeStepRef.current) {
          setActiveStep(calculatedStep);
          setStoryStep(calculatedStep);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-32 border-b border-[#ADD8E6]/10 relative overflow-hidden text-[#FFFAFA]"
    >
      {/* Volumetric glow - Frozen Lake */}
      <div className="prism-glow w-[600px] h-[600px] top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#38BDF8]/15" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1936] border border-[#ADD8E6]/20 text-[#60D5FA] text-xs font-bold tracking-widest uppercase font-mono shadow-md">
            <Layers className="w-3.5 h-3.5 text-[#60D5FA]" />
            SCROLL-DRIVEN 3D STORY · 4 STEPS
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal font-absans tracking-[-0.03em] text-[#FFFAFA] leading-[1.04]">
            How grounded intelligence works.{' '}
            <span className="font-absans font-normal tracking-[-0.02em] prism-gradient-text block">
              Watch your documents transform.
            </span>
          </h2>
          <p className="text-base text-[#8BA8C8] leading-relaxed font-normal font-absans">
            Scroll or select each stage to watch the 3D scene morph in real time from raw uploaded PDFs to high-dimensional embeddings and razor-sharp page proofs.
          </p>
        </div>

        {/* 4-Step Interactive Progress Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {steps.map((st) => {
            const Icon = st.icon;
            const isCurrent = activeStep === st.stepId;
            return (
              <button
                key={st.number}
                onClick={() => handleStepClick(st.stepId)}
                className={`p-5 rounded-2xl text-left transition-all duration-300 border cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0B1936] border-[#60D5FA]/60 shadow-[0_0_30px_rgba(56,189,248,0.3)] ring-1 ring-[#60D5FA]/40 scale-[1.02]'
                    : 'bg-[#060F22]/80 hover:bg-[#0B1936]/70 border-[#ADD8E6]/10 text-[#8BA8C8]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-mori font-semibold tracking-wider px-2 py-0.5 rounded ${
                      isCurrent ? 'bg-[#0284C7] text-white shadow-md' : 'bg-white/5 text-[#8BA8C8]'
                    }`}
                  >
                    STEP {st.number}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${isCurrent ? 'text-[#60D5FA]' : 'text-[#8BA8C8]'}`}
                  />
                </div>
                <div className={`text-sm font-bold truncate mb-1 font-absans ${isCurrent ? 'text-white' : 'text-[#8BA8C8]'}`}>
                  {st.badge}
                </div>
                <div className="text-[11px] text-[#8BA8C8] line-clamp-1 font-absans">
                  {st.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Step Detail Card synced with 3D Morph */}
        <div className="prism-glass rounded-3xl p-8 sm:p-10 border border-[#ADD8E6]/20 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-normal text-[#60D5FA] font-absans">
                  {steps[activeStep - 1].number}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0B1936] border border-[#ADD8E6]/20 text-xs font-absans tracking-wider text-[#60D5FA] font-normal">
                  {steps[activeStep - 1].badge}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-normal font-absans text-white tracking-tight">
                {steps[activeStep - 1].title}
              </h3>

              <p className="text-sm sm:text-base text-[#8BA8C8] leading-relaxed font-absans">
                {steps[activeStep - 1].description}
              </p>

              {/* Architecture Technical Details */}
              <div className="pt-2 space-y-2">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-[#60D5FA] flex items-center gap-2">
                  <span className="text-[#38BDF8] font-bold">&gt;</span>
                  <span>{steps[activeStep - 1].tech}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Real-Time Grounding Telemetry</span>
                  </span>
                  <span className="font-bold">{steps[activeStep - 1].metrics}</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Visual Stage Preview */}
            <div className="lg:col-span-5 rounded-2xl bg-[#060F22]/90 border border-[#ADD8E6]/15 p-6 space-y-4 text-left shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-[#8BA8C8]">
                <span className="font-mono text-white font-semibold">3D Scene State: Step {activeStep} of 4</span>
                <span className="text-[#60D5FA] font-mono">Live Camera Sync</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5">
                <div className="text-[11px] uppercase font-bold text-[#60D5FA] tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D Motion Trigger</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activeStep === 1 && 'Documents smoothly fly into perspective and assemble into an indexed physical stack.'}
                  {activeStep === 2 && 'Document sheets fragment into discrete semantic chunks, emitting glowing high-dimensional embedding nodes.'}
                  {activeStep === 3 && 'A focused query ray penetrates the vector cloud, triggering cosine-similarity node illumination.'}
                  {activeStep === 4 && 'The camera dives into the nearest citation node, unfolding into a 150 DPI page proof with highlighted text.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => handleStepClick(activeStep > 1 ? activeStep - 1 : 4)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-[#8BA8C8] hover:text-white transition cursor-pointer"
                >
                  Previous Step
                </button>
                <button
                  onClick={() => handleStepClick(activeStep < 4 ? activeStep + 1 : 1)}
                  className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Callout & Evaluations Link */}
        <div className="mt-12 p-6 rounded-2xl bg-[#0B1936]/80 border border-[#ADD8E6]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-lg backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 font-absans">
              <ShieldCheck className="w-3.5 h-3.5 text-[#60D5FA]" />
              Curious about retrieval benchmarks & accuracy?
            </span>
            <p className="text-xs text-[#8BA8C8] font-absans">
              DocuMind features an integrated evaluation dashboard measuring citation validity, page accuracy, and sub-40ms latency.
            </p>
          </div>
          <Link
            href="/evaluations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white prism-blue-gradient transition shrink-0 shadow-md hover:scale-[1.02]"
          >
            <span>View Evaluations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
