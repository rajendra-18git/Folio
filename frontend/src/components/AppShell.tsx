'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isFolioCustomPage =
    pathname === '/dashboard' ||
    pathname === '/workspace' ||
    pathname === '/compare' ||
    pathname === '/evaluations' ||
    pathname === '/settings';

  if (isLandingPage || isAuthPage || isFolioCustomPage) {
    return (
      <div className="min-h-screen w-full antialiased selection:bg-[#38BDF8] selection:text-[#040914] transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
