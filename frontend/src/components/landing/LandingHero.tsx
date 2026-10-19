'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  FileText,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);

  // Button magnetic effect
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const rafBtnId = useRef<number | null>(null);

  // 3D Card tilt RAF ref
  const rafCardId = useRef<number | null>(null);

  useEffect(() => {
    // GSAP timeline for hero entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // GSAP entrance animation (from hidden offset to naturally visible)
    if (badgeRef.current) {
      tl.from(badgeRef.current, { y: -20, opacity: 0, duration: 0.6 });
    }
    const lines = headlineRef.current?.querySelectorAll('.hero-line');
    if (lines && lines.length > 0) {
      tl.from(lines, { y: 40, opacity: 0, duration: 0.8, stagger: 0.15 }, '-=0.3');
    }
    if (descRef.current) {
      tl.from(descRef.current, { y: 25, opacity: 0, duration: 0.7 }, '-=0.4');
    }
    if (actionsRef.current) {
      tl.from(actionsRef.current, { y: 25, opacity: 0, duration: 0.6 }, '-=0.3');
    }
    if (trustRef.current) {
      tl.from(trustRef.current, { y: 15, opacity: 0, duration: 0.5 }, '-=0.2');
    }
    if (cardWrapRef.current) {
      tl.from(cardWrapRef.current, { x: 80, opacity: 0, rotateY: -8, duration: 1, ease: 'power2.out' }, '-=0.8');
    }

    // Parallax on scroll for the product card
    const handleScroll = () => {
      if (!cardWrapRef.current || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.5)));
      gsap.set(cardWrapRef.current, {
        y: progress * 60,
        opacity: 1 - progress * 0.4,
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafBtnId.current) cancelAnimationFrame(rafBtnId.current);
      if (rafCardId.current) cancelAnimationFrame(rafCardId.current);
    };
  }, []);

  // Magnetic button hover effect
  const handleBtnMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.22;
    const deltaY = (e.clientY - centerY) * 0.22;

    if (rafBtnId.current) cancelAnimationFrame(rafBtnId.current);
    rafBtnId.current = requestAnimationFrame(() => {
      if (buttonRef.current) {
        buttonRef.current.style.transform = `translate3d(${deltaX.toFixed(1)}px, ${deltaY.toFixed(1)}px, 0)`;
      }
    });
  }, []);

  const handleBtnMouseLeave = useCallback(() => {
    if (rafBtnId.current) cancelAnimationFrame(rafBtnId.current);
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  }, []);

  // Smooth mouse parallax for hero product card
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = -((y - centerY) / centerY) * 8.5;
    const rotY = ((x - centerX) / centerX) * 10;

    if (rafCardId.current) cancelAnimationFrame(rafCardId.current);
    rafCardId.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      }
    });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    if (rafCardId.current) cancelAnimationFrame(rafCardId.current);
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[94vh] flex items-center pt-32 pb-24 md:pt-36 md:pb-28 overflow-hidden"
    >
      {/* Volumetric Background Glows */}
      <div className="prism-glow w-[650px] h-[650px] -top-32 -left-20 bg-[#38BDF8]/20" />
      <div className="prism-glow w-[700px] h-[700px] top-1/4 -right-32 bg-[#0284C7]/20" />
      <div className="prism-glow w-[500px] h-[500px] bottom-0 left-1/3 bg-[#60D5FA]/15" />

      {/* Star Dust Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px] opacity-35 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Copy */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-[#0B1936]/90 border border-sky-200 dark:border-[#60D5FA]/30 text-sky-800 dark:text-[#60D5FA] text-xs font-bold tracking-widest uppercase shadow-sm dark:shadow-xl backdrop-blur-md"
            >
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 dark:bg-[#60D5FA] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-600 dark:bg-[#60D5FA]" />
              </span>
              <span className="font-sans font-semibold tracking-wider text-[11px]">LAUNCHING NOW · FOLIO 2.0</span>
            </div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="text-4xl sm:text-6xl lg:text-[76px] font-normal font-absans tracking-[-0.03em] text-[var(--color-text-primary)] leading-[1.02]"
            >
              <span className="hero-line block">Your documents.</span>
              <span className="hero-line block mt-1 prism-gradient-text">
                A whole new intelligence.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p
              ref={descRef}
              className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl font-normal leading-relaxed"
            >
              Transform PDFs, research papers, textbooks, and reports into knowledge you can explore, question, and understand. Every answer backed by exact page-level visual proofs with zero hallucination.
            </p>

            {/* Actions */}
            <div ref={actionsRef} className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                ref={buttonRef}
                onMouseMove={handleBtnMouseMove}
                onMouseLeave={handleBtnMouseLeave}
                href="/workspace"
                style={{
                  transform: 'translate3d(0, 0, 0)',
                  transition: 'transform 0.12s ease-out, box-shadow 0.25s ease',
                }}
                className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm text-white prism-blue-gradient shadow-[0_0_25px_rgba(2,132,199,0.35)] hover:shadow-[0_0_35px_rgba(14,165,233,0.5)] active:scale-[0.98] border border-white/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-200 dark:text-[#60D5FA]" />
                  <span className="font-sans font-semibold tracking-normal text-[15px]">Start for Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <a
                href="#workflows"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-sm text-slate-700 dark:text-[#FFFAFA] hover:text-sky-700 dark:hover:text-[#60D5FA] bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/10 backdrop-blur-md transition-all duration-200 shadow-sm"
              >
                <span>See How It Works</span>
                <ChevronRight className="w-4 h-4 text-slate-500 dark:text-[#8BA8C8]" />
              </a>
            </div>

            {/* Trust Highlights */}
            <div ref={trustRef} className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-[#60D5FA]" />
                <span>Zero-Hallucination Evidence Grounding</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
                <span>150 DPI Visual Page Proofs</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-500 dark:text-[#ADD8E6]" />
                <span>Local Vector Privacy</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Product Card */}
          <div
            ref={cardWrapRef}
            className="lg:col-span-6 relative flex items-center justify-center"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            {/* Ambient Halo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0284C7]/20 via-[#38BDF8]/15 to-[#60D5FA]/20 rounded-3xl blur-3xl opacity-60 pointer-events-none" />

            <div className="w-full max-w-xl animate-subtle-float">
              <div
                ref={cardRef}
                style={{
                  transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full relative prism-glass rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.1)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] [transform-style:preserve-3d]"
              >
                {/* Window Titlebar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 [transform:translateZ(15px)]">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-[#8BA8C8]">
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
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-[#0B1936] border border-emerald-200 dark:border-white/10 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Verified 150 DPI</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="py-4 space-y-3.5 [transform:translateZ(25px)] text-left">
                  <div className="ml-auto p-3 rounded-2xl bg-[#0284C7] text-white text-xs font-medium max-w-[85%] shadow-md border border-white/10">
                    How does the paper reduce quadratic attention memory for context lengths &gt; 32k tokens?
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#060F22]/95 border border-slate-200 dark:border-[#ADD8E6]/15 text-xs leading-relaxed space-y-3 shadow-md dark:shadow-xl">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1.5 text-sky-700 dark:text-[#60D5FA]">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-[#60D5FA]" />
                        Grounded Answer · Zero Hallucination
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                        Cosine: 0.962 · 38ms
                      </span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-xs">
                      The architecture decomposes the kernel matrix via randomized feature maps, reducing the quadratic space complexity <span className="font-mono text-sky-700 dark:text-[#60D5FA]">O(n²·d)</span> to linear space <span className="font-mono text-sky-700 dark:text-[#60D5FA]">O(n·d²)</span>. This eliminates GPU memory bottlenecks by 78% for &gt;32k tokens without retraining.
                    </p>

                    {/* Citation Preview */}
                    <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-white/[0.04] border border-sky-200 dark:border-[#60D5FA]/30 [transform:translateZ(20px)] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-[#8BA8C8]">
                        <span className="flex items-center gap-1.5 text-sky-800 dark:text-[#60D5FA] font-bold">
                          <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-[#60D5FA]" />
                          Citation Preview · Page 14
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Match 96.2%</span>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-black/50 border-l-2 border-sky-600 dark:border-[#60D5FA] text-[11px] text-slate-700 dark:text-slate-300 italic font-sans leading-relaxed">
                        &ldquo;...decomposition achieves sub-quadratic memory footprint while preserving perplexity bounds on long sequences.&rdquo;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telemetry Bar */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-[#8BA8C8] [transform:translateZ(15px)]">
                  <span className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-white">
                    <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-[#60D5FA]" />
                    High-Performance Vector Engine
                  </span>
                  <span className="text-sky-700 dark:text-[#60D5FA]">1,536-D Embeddings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
