'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DocuMindLogo } from '@/components/DocuMindLogo';
import { Menu, X, ArrowRight, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import gsap from 'gsap';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate nav links on mount
  useEffect(() => {
    if (!linksRef.current) return;
    const links = linksRef.current.querySelectorAll('a, button');
    gsap.fromTo(
      links,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, duration: 0.6, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  const navLinks = [
    { label: 'Workflow', href: '#workflows' },
    { label: 'Features', href: '#features' },
    { label: 'FAQ', href: '#faq' },
  ];

  const isLight = theme === 'light';

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isLight
            ? 'h-16 bg-white/85 backdrop-blur-2xl border-b border-sky-200/60 shadow-[0_4px_25px_rgba(15,23,42,0.06)]'
            : 'h-16 bg-[#040914]/85 backdrop-blur-2xl border-b border-[#ADD8E6]/15 shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
          : isLight
          ? 'h-20 bg-white/40 backdrop-blur-md border-b border-sky-100/60'
          : 'h-20 bg-[#040914]/40 backdrop-blur-md border-b border-[#ADD8E6]/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Left: Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <DocuMindLogo size={scrolled ? 32 : 36} showText={true} />
        </Link>

        {/* Center: Nav Links as Glossy Separate Buttons */}
        <nav ref={linksRef} className="hidden md:flex items-center gap-2.5 text-[13px] font-medium font-absans">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`relative group px-4 py-1.5 rounded-full text-center transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-xl select-none ${
                isLight
                  ? 'bg-gradient-to-b from-white/95 via-white/80 to-sky-50/60 text-slate-700 border border-white/90 border-t-white shadow-[0_2px_8px_rgba(2,132,199,0.08),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(2,132,199,0.06)] hover:from-white hover:to-sky-100/70 hover:text-sky-800 hover:border-sky-300/80 hover:shadow-[0_4px_16px_rgba(2,132,199,0.18),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                  : 'bg-gradient-to-b from-white/[0.12] via-white/[0.06] to-transparent text-[#ADD8E6] border border-white/[0.14] border-t-white/[0.32] shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.3)] hover:from-[#60D5FA]/25 hover:via-white/[0.08] hover:to-[#0284C7]/15 hover:text-white hover:border-[#60D5FA]/60 hover:shadow-[0_0_20px_rgba(96,213,250,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
              }`}
            >
              {/* Glossy top specular reflection highlight */}
              <span className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 dark:from-white/25 to-transparent rounded-t-full pointer-events-none" />
              <span className="relative z-10 tracking-wide font-medium">{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Right: Conversion CTAs & Theme Toggle */}
        <div className="hidden md:flex items-center gap-4 font-absans">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-all duration-200 border cursor-pointer ${
              isLight
                ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200 shadow-sm'
                : 'bg-[#0B1936] hover:bg-[#122854] text-[#60D5FA] border-[#ADD8E6]/20 shadow-md'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Light and Dark Mode"
          >
            {isLight ? (
              <Moon className="w-4 h-4 transition-transform hover:rotate-12" />
            ) : (
              <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/workspace"
                className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold text-white prism-blue-gradient shadow-md shadow-[#0284C7]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold border transition ${
                  isLight
                    ? 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-rose-600'
                    : 'border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-rose-400'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-[13px] font-semibold px-3 py-2 transition ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-[#8BA8C8] hover:text-white'
                }`}
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold text-white prism-blue-gradient shadow-lg shadow-[#0284C7]/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 border border-white/20 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>Start for Free</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition border cursor-pointer ${
              isLight
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-[#0B1936] text-[#60D5FA] border-[#ADD8E6]/20'
            }`}
            aria-label="Toggle theme"
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl transition ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-[#8BA8C8] hover:text-white hover:bg-white/[0.06]'
            }`}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-6 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200 text-left font-absans border-b backdrop-blur-2xl ${
            isLight
              ? 'bg-white/98 border-sky-200/60'
              : 'bg-[#040914]/98 border-[#ADD8E6]/15'
          }`}
        >
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium py-2 border-b ${
                  isLight
                    ? 'text-slate-700 hover:text-sky-700 border-slate-100'
                    : 'text-[#8BA8C8] hover:text-white border-white/[0.04]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 flex flex-col gap-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/workspace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-white prism-blue-gradient shadow-lg shadow-[#0284C7]/30 flex items-center justify-center gap-2"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold border ${
                    isLight
                      ? 'text-rose-600 bg-rose-50 border-rose-200'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  }`}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold border ${
                    isLight
                      ? 'text-slate-800 bg-slate-50 border-slate-200'
                      : 'text-white bg-white/[0.06] border-white/10'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-white prism-blue-gradient shadow-lg shadow-[#0284C7]/30 flex items-center justify-center gap-2"
                >
                  <span>Start for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
