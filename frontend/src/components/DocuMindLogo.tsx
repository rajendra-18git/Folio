'use client';

import React from 'react';

export interface FolioLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'auto' | 'primary' | 'reversed';
  showSubtitle?: boolean;
}

export function FolioLogo({
  size = 38,
  className = '',
  showText = false,
  variant = 'auto',
  showSubtitle = true,
}: FolioLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Folio Brand Icon Mark */}
      <div
        style={{ width: size, height: (size * 120) / 100 }}
        className="relative shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <svg
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Main Document Body */}
          <path
            d="M26 8H62L90 36V96C90 104.837 82.8366 112 74 112H26C17.1634 112 10 104.837 10 96V24C10 15.1634 17.1634 8 26 8Z"
            className={
              variant === 'primary'
                ? 'fill-[#2563EB]'
                : variant === 'reversed'
                ? 'fill-[#FFFFFF]'
                : 'fill-[#2563EB] dark:fill-[#FFFFFF]'
            }
          />

          {/* Folded Top-Right Dog-Ear Corner */}
          <path
            d="M62 8V26C62 31.5228 66.4772 36 72 36H90L62 8Z"
            className={
              variant === 'primary'
                ? 'fill-[#93C5FD]'
                : variant === 'reversed'
                ? 'fill-[#BFDBFE]'
                : 'fill-[#93C5FD] dark:fill-[#BFDBFE]'
            }
          />

          {/* Bold Letter F */}
          <path
            d="M32 42H72V54H46V63H66V74H46V92H32V42Z"
            className={
              variant === 'primary'
                ? 'fill-[#FFFFFF]'
                : variant === 'reversed'
                ? 'fill-[#0F172A]'
                : 'fill-[#FFFFFF] dark:fill-[#0F172A]'
            }
          />
        </svg>
      </div>

      {/* Wordmark "Folio" */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-absans font-extrabold tracking-[-0.03em] text-[1.28rem] transition-colors ${
                variant === 'primary'
                  ? 'text-[#0F172A]'
                  : variant === 'reversed'
                  ? 'text-[#FFFFFF]'
                  : 'text-[#0F172A] dark:text-[#FFFFFF]'
              }`}
            >
              Folio
            </span>
            <span className="text-[10px] px-1.5 py-0.5 font-bold tracking-wider uppercase text-sky-700 dark:text-[#60D5FA] bg-sky-100 dark:bg-sky-950/60 rounded border border-sky-300/60 dark:border-sky-500/30">
              AI
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-1 transition-colors">
              Document Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Backward-compatible alias for existing imports
export const DocuMindLogo = FolioLogo;
export default FolioLogo;
