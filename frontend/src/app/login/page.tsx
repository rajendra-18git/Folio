'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to workspace
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/workspace');
    }
  }, [isAuthenticated, router]);

  const handleUseDemo = () => {
    setEmail('demo@folio.ai');
    setPassword('demo1234');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      router.push('/workspace');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg === 'Failed to fetch' || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setErrorMessage(
          'Cannot connect to backend server. Please verify the backend service is running.'
        );
      } else {
        setErrorMessage(msg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
          minHeight: '100vh',
          boxSizing: 'border-box',
          padding: '40px 24px',
          background: '#2F5BFF',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Figtree', -apple-system, BlinkMacSystemFont, sans-serif",
          color: '#0E1530',
        }}
      >
        {/* Left Decorative Watermark Document */}
        <svg
          aria-hidden="true"
          width="420"
          height="420"
          viewBox="0 0 120 120"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.35"
          strokeWidth="0.8"
          style={{
            position: 'absolute',
            left: '-90px',
            top: '60px',
            transform: 'rotate(-12deg)',
            pointerEvents: 'none',
          }}
        >
          <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" />
          <path d="M72 8V38H102" />
          <path d="M38 52H80M38 66H80M38 80H64" />
        </svg>

        {/* Right Decorative Watermark Document */}
        <svg
          aria-hidden="true"
          width="480"
          height="480"
          viewBox="0 0 120 120"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.35"
          strokeWidth="0.8"
          style={{
            position: 'absolute',
            right: '-110px',
            bottom: '-80px',
            transform: 'rotate(10deg)',
            pointerEvents: 'none',
          }}
        >
          <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" />
          <path d="M72 8V38H102" />
          <path d="M38 52H80M38 66H80M38 80H64" />
        </svg>

        {/* Top Back Link */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 20 }}>
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
            className="hover:opacity-100 transition"
          >
            <span>←</span> Back to Folio
          </Link>
        </div>

        {/* White Center Login Card */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
            boxSizing: 'border-box',
            padding: '40px',
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 25px 60px -15px rgba(14,21,48,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            zIndex: 10,
          }}
        >
          {/* Logo & Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'center',
            }}
          >
            <Link href="/" style={{ textDecoration: 'none' }}>
              <svg role="img" aria-label="Folio logo mark" width="56" height="56" viewBox="0 0 120 120">
                <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" fill="#2F5BFF" />
                <path d="M72 8V38H102Z" fill="#1C3FCF" />
                <rect x="38" y="48" width="12" height="50" rx="3" fill="#FFFFFF" />
                <rect x="38" y="48" width="38" height="12" rx="3" fill="#FFFFFF" />
                <rect x="38" y="70" width="26" height="11" rx="3" fill="#FFFFFF" />
              </svg>
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "'Sora', 'Figtree', sans-serif",
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  color: '#0E1530',
                }}
              >
                Sign in to Folio
              </h1>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5, color: '#5B6478' }}>
                Your documents, ready to answer.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '14px',
                lineHeight: 1.4,
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ fontSize: '14px', fontWeight: 600, color: '#0E1530' }}>
                Email address
              </label>
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
                  height: '50px',
                  padding: '0 16px',
                  fontSize: '16px',
                  color: '#0E1530',
                  background: '#F6F8FC',
                  border: '1px solid #C9D0E0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: "'Figtree', sans-serif",
                }}
                className="focus:ring-2 focus:ring-[#2F5BFF] focus:border-[#2F5BFF] transition"
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label htmlFor="password" style={{ fontSize: '14px', fontWeight: 600, color: '#0E1530' }}>
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleUseDemo();
                  }}
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2F5BFF',
                    textDecoration: 'none',
                  }}
                  className="hover:text-[#1C3FCF] transition"
                >
                  Forgot?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
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
                    height: '50px',
                    padding: '0 52px 0 16px',
                    fontSize: '16px',
                    color: '#0E1530',
                    background: '#F6F8FC',
                    border: '1px solid #C9D0E0',
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: "'Figtree', sans-serif",
                  }}
                  className="focus:ring-2 focus:ring-[#2F5BFF] focus:border-[#2F5BFF] transition"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    top: '3px',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 0,
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? (
                    <svg
                      aria-hidden="true"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#5B6478"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4" />
                      <path d="M6.5 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1" />
                      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#5B6478"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  background: '#2F5BFF',
                  border: 0,
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
                className="hover:bg-[#1C3FCF] transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <svg
                      aria-hidden="true"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>

              {/* Demo shortcut helper */}
              <button
                type="button"
                onClick={handleUseDemo}
                style={{
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#2F5BFF',
                  background: '#F0F4FF',
                  border: '1px solid #D6E2FF',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
                className="hover:bg-[#E3ECFF] transition"
              >
                Auto-fill Demo Account (demo@folio.ai)
              </button>
            </div>

            {/* New here */}
            <p style={{ margin: 0, textAlign: 'center', fontSize: '15px', color: '#5B6478' }}>
              New here?{' '}
              <Link
                href="/register"
                style={{ color: '#2F5BFF', fontWeight: 700, textDecoration: 'none' }}
                className="hover:text-[#1C3FCF]"
              >
                Create a free account
              </Link>
            </p>
          </form>
        </div>

        {/* Security / JWT Badge */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#FFFFFF',
            zIndex: 10,
          }}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6Z" />
            <path d="M9 12l2.2 2.2L15.5 10" />
          </svg>
          <span>Secured with end-to-end JWT authentication</span>
        </div>
      </div>
  );
}
