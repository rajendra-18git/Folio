'use client';

import React from 'react';
import Link from 'next/link';
import { DocuMindLogo } from '@/components/DocuMindLogo';
import { ShieldCheck } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '@/lib/useScrollAnimation';

export function LandingFooter() {
  const brandRef = useScrollReveal<HTMLDivElement>({ y: 30, duration: 0.7 });
  const linksRef = useStaggerReveal<HTMLDivElement>('.footer-col', {
    y: 25,
    stagger: 0.1,
    duration: 0.6,
  });
  const bottomRef = useScrollReveal<HTMLDivElement>({ y: 20, duration: 0.5, delay: 0.2 });

  return (
    <footer className="bg-slate-100/80 dark:bg-[#040914] border-t border-slate-200 dark:border-[#ADD8E6]/10 text-slate-600 dark:text-[#8BA8C8] text-xs py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={linksRef} className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-200 dark:border-[#ADD8E6]/10 text-left font-absans">
          {/* Brand Info */}
          <div ref={brandRef} className="footer-col md:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
              <DocuMindLogo size={36} showText={true} />
            </Link>
            <p className="text-slate-600 dark:text-[#8BA8C8] text-xs leading-relaxed max-w-sm">
              Transform PDFs, textbooks, research papers, and business documents into searchable, grounded knowledge with generative AI.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-sky-700 dark:text-[#60D5FA] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Grounded Document Intelligence · Production AI Architecture</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-col md:col-span-3 space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Product Intelligence</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/workspace" className="hover:text-slate-900 dark:hover:text-white transition">
                  AI Grounded Workspace
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-slate-900 dark:hover:text-white transition">
                  Smart Study Assistant
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-slate-900 dark:hover:text-white transition">
                  Multi-Document Comparison
                </Link>
              </li>
              <li>
                <Link href="/multimodal" className="hover:text-slate-900 dark:hover:text-white transition">
                  Multimodal Visual Analysis
                </Link>
              </li>
              <li>
                <Link href="/evaluations" className="hover:text-slate-900 dark:hover:text-white transition">
                  Evaluation Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Resources */}
          <div className="footer-col md:col-span-2 space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Platform</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/documents" className="hover:text-slate-900 dark:hover:text-white transition">
                  Document Library
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-slate-900 dark:hover:text-white transition">
                  Provider Settings
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition">
                  Internal Dashboard
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition">
                  Architecture FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Trust */}
          <div className="footer-col md:col-span-2 space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Privacy & Trust</h5>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-[#8BA8C8]">
              <li>Local SQLite Storage</li>
              <li>Local Vector Indexing</li>
              <li>Untrusted Context Guard</li>
              <li>Zero Data Training</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div ref={bottomRef} className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-[#8BA8C8] text-left font-absans">
          <p>© 2026 Folio. All rights reserved. Document Intelligence Platform.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              Built with precision for research &amp; curriculum preparation
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
