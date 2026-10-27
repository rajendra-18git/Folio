'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/workspace');
    }
  }, [isAuthenticated, router]);


  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(cleanEmail, password);
      router.push('/workspace');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#2F5BFF',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        fontFamily: "'Figtree', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Sora:wght@600;700&display=swap"
      />

      {/* Background Decorative Vector SVGs */}
      <svg
        aria-hidden="true"
        width="420"
        height="420"
        viewBox="0 0 120 120"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="0.8"
        style={{
          position: 'absolute',
          left: '-100px',
          top: '80px',
          transform: 'rotate(-14deg)',
          pointerEvents: 'none',
        }}
      >
        <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" />
        <path d="M72 8V38H102" />
        <path d="M38 52H80M38 66H80M38 80H64" />
      </svg>
      <svg
        aria-hidden="true"
        width="460"
        height="460"
        viewBox="0 0 120 120"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="0.8"
        style={{
          position: 'absolute',
          right: '-110px',
          bottom: '-90px',
          transform: 'rotate(12deg)',
          pointerEvents: 'none',
        }}
      >
        <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" />
        <path d="M72 8V38H102" />
        <path d="M38 52H80M38 66H80M38 80H64" />
      </svg>

      {/* Top Bar Back to Home */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '440px', zIndex: 10, marginBottom: '16px' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            textDecoration: 'none',
            opacity: 0.9,
          }}
        >
          <span style={{ fontSize: '18px' }}>←</span> Back to Folio
        </Link>
      </div>

      {/* Center White Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          boxSizing: 'border-box',
          padding: '36px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(14,21,48,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <svg role="img" aria-label="Folio logo mark" width="52" height="52" viewBox="0 0 120 120">
              <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" fill="#2F5BFF" />
              <path d="M72 8V38H102Z" fill="#1C3FCF" />
              <rect x="38" y="48" width="12" height="50" rx="3" fill="#FFFFFF" />
              <rect x="38" y="48" width="38" height="12" rx="3" fill="#FFFFFF" />
              <rect x="38" y="70" width="26" height="11" rx="3" fill="#FFFFFF" />
            </svg>
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "'Sora', 'Figtree', sans-serif",
                fontSize: '26px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#0E1530',
              }}
            >
              Sign in to Folio
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#5B6478' }}>
              Your documents, ready to answer.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '13px',
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Password Authentication Form */}
        <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="email" style={{ fontSize: '14px', fontWeight: 600, color: '#0E1530' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '15px',
                  color: '#7A8499',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: '48px',
                  padding: '0 16px 0 42px',
                  fontSize: '15px',
                  color: '#0E1530',
                  background: '#F6F8FC',
                  border: '1px solid #C9D0E0',
                  borderRadius: '12px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="password" style={{ fontSize: '14px', fontWeight: 600, color: '#0E1530' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '15px',
                  color: '#7A8499',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: '48px',
                  padding: '0 64px 0 42px',
                  fontSize: '15px',
                  color: '#0E1530',
                  background: '#F6F8FC',
                  border: '1px solid #C9D0E0',
                  borderRadius: '12px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#5B6478',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              background: '#2F5BFF',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '15px',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(47,91,255,0.3)',
              marginTop: '4px',
              transition: 'background 0.15s ease',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

        {/* Divider & Switch to Register */}
        <hr style={{ border: 0, borderTop: '1px solid #E3E8F3', margin: 0 }} />

        <div style={{ textAlign: 'center', fontSize: '14px', color: '#5B6478' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ fontWeight: 700, color: '#2F5BFF', textDecoration: 'none' }}>
            Create one free
          </Link>
        </div>
      </div>

      {/* Security Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '20px',
          fontSize: '13px',
          color: '#FFFFFF',
          opacity: 0.9,
          zIndex: 10,
        }}
      >
        <ShieldCheck size={16} />
        <span>Secured with end-to-end JWT authentication</span>
      </div>
    </div>
  );
}
