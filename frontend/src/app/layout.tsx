import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './uiverse.css';
import { AppShell } from '@/components/AppShell';
import { ToastProvider } from '@/components/Toast';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Folio — Document Intelligence & Study Assistant',
  description:
    'Grounded AI-powered document intelligence, exam notes & quiz generator, multimodal visual analysis, and multi-document comparison.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth light" data-theme="light">
      <head>
        {/* Force light-mode: prevents system dark-mode from affecting the page */}
        <meta name="color-scheme" content="light" />
        <meta name="darkreader-lock" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&family=Sora:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
