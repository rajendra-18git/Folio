'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UploadCloud, LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => {
        if (res.ok) setIsBackendHealthy(true);
        else setIsBackendHealthy(false);
      })
      .catch(() => setIsBackendHealthy(false));
  }, []);

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-slate-800">
          Document Intelligence & Study Assistant
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/70 text-[11px] font-medium text-slate-600">
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendHealthy === true
                ? 'bg-emerald-500 shadow-sm shadow-emerald-400'
                : isBackendHealthy === false
                ? 'bg-rose-500 shadow-sm shadow-rose-400'
                : 'bg-amber-400 animate-pulse'
            }`}
          />
          {isBackendHealthy === true ? 'Backend Connected' : isBackendHealthy === false ? 'Backend Offline' : 'Connecting...'}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/documents"
          className="button type1"
        >
          <span className="btn-txt">
            <UploadCloud className="w-3.5 h-3.5 shrink-0" />
            <span>Upload PDF</span>
          </span>
        </Link>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-slate-800">
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white text-[11px] font-bold flex items-center justify-center">
                {getInitials(user.full_name, user.email)}
              </div>
              <span className="text-xs font-medium max-w-[120px] truncate hidden md:inline">
                {user.full_name || user.email}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
