'use client';

import React, { useEffect, useState } from 'react';
import { DocuMindLogo } from '@/components/DocuMindLogo';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    // Smooth progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Rapid initial, smooth near end
        const step = Math.max(2, Math.floor((100 - prev) * 0.22) + 3);
        const next = Math.min(100, prev + step);
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        setIsFadingOut(true);
        const removeTimeout = setTimeout(() => {
          setIsRemoved(true);
          onComplete?.();
        }, 650);
        return () => clearTimeout(removeTimeout);
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  if (isRemoved) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F4F8FC] dark:bg-[#040914] transition-opacity duration-700 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-live="polite"
      aria-busy={progress < 100}
    >
      {/* Volumetric ambient background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#0284C7]/20 via-[#38BDF8]/15 to-[#60D5FA]/20 dark:from-[#0284C7]/25 dark:via-[#38BDF8]/20 dark:to-[#60D5FA]/20 blur-[130px] pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 space-y-7 text-center">
        {/* Glowing DocuMind Logo */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#0284C7] to-[#60D5FA] rounded-2xl blur-xl opacity-40 dark:opacity-50 animate-pulse" />
          <DocuMindLogo size={64} className="relative transform hover:scale-105 transition-transform" />
        </div>

        {/* Brand Title & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-normal tracking-tight text-slate-900 dark:text-white font-absans">
            DocuMind <span className="prism-gradient-text">AI</span>
          </h2>
          <p className="text-xs font-mono tracking-widest text-sky-700 dark:text-[#60D5FA] uppercase font-bold">
            {progress < 100 ? 'INITIALIZING NEURAL LATTICE...' : 'SYSTEM READY'}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-2">
          <div className="w-full h-1.5 bg-slate-200/80 dark:bg-white/[0.08] rounded-full overflow-hidden p-0.5 border border-sky-200/60 dark:border-[#ADD8E6]/20 backdrop-blur-md">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#60D5FA] shadow-[0_0_12px_rgba(96,213,250,0.7)] transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-[#8BA8C8]">
            <span>GROUNDED INTELLIGENCE</span>
            <span className="text-sky-700 dark:text-[#60D5FA] font-bold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
