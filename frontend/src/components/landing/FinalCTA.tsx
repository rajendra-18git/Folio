'use client';

import React, { useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollAnimation';

export function FinalCTA() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const rafId = useRef<number | null>(null);

  // Scroll-reveal for the entire CTA block
  const sectionRef = useScrollReveal<HTMLDivElement>({ y: 80, scale: 0.96, duration: 1.1, ease: 'power3.out' });

  const handleBtnMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.3;
    const deltaY = (e.clientY - centerY) * 0.3;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (buttonRef.current) {
        buttonRef.current.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      }
    });
  }, []);

  const handleBtnMouseLeave = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  }, []);

  return (
    <section className="relative py-36 overflow-hidden text-center bg-transparent transition-colors duration-300">
      {/* Volumetric Glow Orbs */}
      <div className="prism-glow w-[750px] h-[750px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#38BDF8]/20 animate-pulse" />
      <div className="prism-glow w-[550px] h-[550px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#60D5FA]/20" />
      <div className="prism-glow w-[400px] h-[400px] top-1/3 left-1/2 -translate-x-1/2 bg-[#0284C7]/15" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div
          ref={sectionRef}
          className="rounded-3xl prism-glass p-12 sm:p-20 relative overflow-hidden border border-slate-200 shadow-2xl shadow-sky-900/10 [transform-style:preserve-3d]"
        >
          {/* Spinning Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
            <div className="w-[420px] h-[420px] rounded-full border border-sky-400 shadow-[0_0_80px_rgba(96,213,250,0.3)] animate-spin [animation-duration:40s]" />
            <div className="absolute w-[340px] h-[340px] rounded-full border border-sky-300 shadow-[0_0_60px_rgba(56,189,248,0.3)] animate-spin [animation-duration:25s] [animation-direction:reverse]" />
            <div className="absolute w-[260px] h-[260px] rounded-full border border-sky-200 shadow-[0_0_50px_rgba(173,216,230,0.4)]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold uppercase tracking-widest text-sky-700 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-mono">READY TO START</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-normal font-absans text-[var(--color-text-primary)] tracking-[-0.03em] leading-[1.02]">
              Ready to understand{' '}
              <span className="prism-gradient-text block">your documents?</span>
            </h2>

            {/* Copy */}
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto font-normal font-absans leading-relaxed">
              Bring your documents together. Ask better questions. Understand more. Every answer backed by exact page-level citations with zero hallucination.
            </p>

            {/* Magnetic CTA Button */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
              <Link
                ref={buttonRef}
                onMouseMove={handleBtnMouseMove}
                onMouseLeave={handleBtnMouseLeave}
                href="/workspace"
                style={{
                  transform: 'translate3d(0, 0, 0)',
                  transition: 'transform 0.15s ease-out, box-shadow 0.25s ease',
                }}
                className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full font-extrabold text-base text-white prism-blue-gradient shadow-[0_0_35px_rgba(56,189,248,0.5)] hover:shadow-[0_0_55px_rgba(96,213,250,0.7)] active:scale-[0.98] border border-white/25 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                <span className="relative z-10 flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-white" />
                  <span className="font-absans tracking-wide text-lg">Start for Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Zero-Hallucination Fallback Architecture</span>
              </div>
              <span className="hidden sm:inline">·</span>
              <span>No Credit Card Required</span>
              <span className="hidden sm:inline">·</span>
              <span>Local Vector Privacy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
