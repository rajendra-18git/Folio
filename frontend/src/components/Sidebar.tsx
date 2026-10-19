'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain,
  Files,
  MessageSquareText,
  GraduationCap,
  GitCompare,
  Eye,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '@/lib/api';
import { DocuMindLogo } from '@/components/DocuMindLogo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Brain },
  { href: '/documents', label: 'Documents', icon: Files },
  { href: '/workspace', label: 'AI Workspace', icon: MessageSquareText },
  { href: '/study', label: 'Study Assistant', icon: GraduationCap },
  { href: '/compare', label: 'Doc Comparison', icon: GitCompare },
  { href: '/multimodal', label: 'Visual Analysis', icon: Eye },
  { href: '/evaluations', label: 'Evaluations', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    api.getSettingsStatus()
      .then((status) => setIsConfigured(status.gemini_configured))
      .catch(() => setIsConfigured(false));
  }, []);

  const normalizedPath = (pathname || '').replace(/\/$/, '');

  return (
    <aside
      className={`relative flex flex-col shrink-0 border-r border-slate-200/90 bg-white/80 backdrop-blur-md transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 z-40 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-slate-50 transition cursor-pointer"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div className={`flex items-center h-16 border-b border-slate-200/80 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        <Link href="/" className="flex items-center overflow-hidden" title="Folio">
          <DocuMindLogo size={36} showText={!collapsed} />
        </Link>
      </div>

      {/* Nav Links */}
      <div className={`flex-1 py-4 space-y-1.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            normalizedPath === item.href ||
            (item.href !== '/' && normalizedPath.startsWith(item.href + '/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center rounded-xl font-medium text-sm border transition-colors duration-150 select-none ${
                collapsed
                  ? 'justify-center w-11 h-11 mx-auto'
                  : 'gap-3 px-3.5 py-2.5'
              } ${
                isActive
                  ? 'bg-sky-50 text-sky-800 font-semibold border-sky-200 shadow-xs hover:bg-sky-100/70 hover:text-sky-900'
                  : 'text-slate-600 border-transparent hover:bg-slate-100/80 hover:text-slate-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {/* Permanent Active Indicator Bar on Selected Item */}
              {isActive && (
                <span
                  className={`absolute bg-sky-600 rounded-full transition-all duration-150 ${
                    collapsed
                      ? 'left-1 top-2.5 bottom-2.5 w-1'
                      : 'left-1 top-2 bottom-2 w-1.5'
                  }`}
                  aria-hidden="true"
                />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 transition-colors duration-150 ${
                  isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* System Status Footprint */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2 mb-1.5">
            {isConfigured ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                AI Engine Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                Retrieval Engine Active
              </span>
            )}
          </div>
          <p className="text-slate-500 text-[11px] leading-tight mb-2">
            {isConfigured
              ? 'Full grounded reasoning & multimodal analysis enabled.'
              : 'Add an API key in Settings to enable generative synthesis.'}
          </p>
          <Link
            href="/settings"
            className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] flex items-center gap-1"
          >
            Engine Settings &rarr;
          </Link>
        </div>
      )}
    </aside>
  );
}
