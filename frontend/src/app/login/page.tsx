'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Mail, KeyRound, ArrowRight, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithOtp, sendOtp, isAuthenticated } = useAuth();

  // Mode: 'password' or 'otp'
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP specific states
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [debugHint, setDebugHint] = useState<string | null>(null);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/workspace');
    }
  }, [isAuthenticated, router]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleUseDemo = () => {
    setAuthMode('password');
    setEmail('demo@folio.ai');
    setPassword('demo1234');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await sendOtp(cleanEmail, 'login');
      setOtpSent(true);
      setOtpCountdown(60); // 60s cooldown
      setDebugHint(res.debug_hint || null);

      if (res.debug_hint) {
        setOtpCode(res.debug_hint);
      }

      setSuccessMessage(
        res.email_sent
          ? `6-digit verification code dispatched to ${cleanEmail}`
          : `Verification code generated for ${cleanEmail}`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setIsLoading(true);
      await loginWithOtp(email.trim().toLowerCase(), cleanCode);
      router.push('/workspace');
    } catch (err: any) {
      const msg = err?.message || '';
      setErrorMessage(msg || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
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
      {/* Decorative Watermark Documents */}
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

      <svg
        aria-hidden="true"
        width="360"
        height="360"
        viewBox="0 0 120 120"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.35"
        strokeWidth="0.8"
        style={{
          position: 'absolute',
          right: '-70px',
          bottom: '40px',
          transform: 'rotate(14deg)',
          pointerEvents: 'none',
        }}
      >
        <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" />
        <path d="M72 8V38H102" />
        <circle cx="50" cy="65" r="14" />
        <path d="M60 75L76 91" />
      </svg>

      {/* Top Bar Back to Home */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '440px', zIndex: 10 }}>
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

        {/* Authentication Mode Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            background: '#F0F4FF',
            padding: '4px',
            borderRadius: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            style={{
              padding: '9px 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              background: authMode === 'password' ? '#FFFFFF' : 'transparent',
              color: authMode === 'password' ? '#0E1530' : '#5B6478',
              boxShadow: authMode === 'password' ? '0 2px 6px rgba(14,21,48,0.06)' : 'none',
            }}
          >
            <KeyRound size={15} />
            Password
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            style={{
              padding: '9px 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              background: authMode === 'otp' ? '#FFFFFF' : 'transparent',
              color: authMode === 'otp' ? '#0E1530' : '#5B6478',
              boxShadow: authMode === 'otp' ? '0 2px 6px rgba(14,21,48,0.06)' : 'none',
            }}
          >
            <Mail size={15} />
            Email OTP
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#10B981',
                background: '#ECFDF5',
                padding: '2px 5px',
                borderRadius: '6px',
              }}
            >
              Direct
            </span>
          </button>
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
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#15803D',
              fontSize: '13px',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldCheck size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 1: EMAIL OTP AUTHENTICATION */}
        {/* ============================================================ */}
        {authMode === 'otp' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {!otpSent ? (
              // Step 1: Request OTP
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="otp-email" style={{ fontSize: '14px', fontWeight: 600, color: '#0E1530' }}>
                    Email address
                  </label>
                  <input
                    id="otp-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '15px',
                      color: '#0E1530',
                      background: '#F6F8FC',
                      border: '1px solid #C9D0E0',
                      borderRadius: '12px',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    We'll email you a secure 6-digit one-time code to sign in instantly.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#2F5BFF',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: isSendingOtp ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(47,91,255,0.3)',
                  }}
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Dispatching code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Step 2: Enter 6-digit Code
              <form onSubmit={handleOtpLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="otp-input" style={{ fontSize: '14px', fontWeight: 600, color: '#0E1530' }}>
                      6-Digit Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setDebugHint(null);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2F5BFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Change email
                    </button>
                  </div>

                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      height: '54px',
                      padding: '0 16px',
                      fontSize: '24px',
                      fontWeight: 700,
                      letterSpacing: '8px',
                      textAlign: 'center',
                      fontFamily: "'Courier New', monospace",
                      color: '#1C3FCF',
                      background: '#F0F4FF',
                      border: '1.5px solid #2F5BFF',
                      borderRadius: '12px',
                      outline: 'none',
                    }}
                  />

                  {/* Dev Code Auto-fill badge */}
                  {debugHint && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#EEF2FF',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#4338CA',
                      }}
                    >
                      <span>Code received: <strong>{debugHint}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(debugHint)}
                        style={{
                          background: '#4F46E5',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      Sent to <strong>{email}</strong>
                    </span>
                    <button
                      type="button"
                      disabled={otpCountdown > 0 || isSendingOtp}
                      onClick={() => handleSendOtp()}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: otpCountdown > 0 ? '#9CA3AF' : '#2F5BFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: otpCountdown > 0 ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <RefreshCw size={12} className={isSendingOtp ? 'animate-spin' : ''} />
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend code'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '12px',
                    background: otpCode.length < 6 ? '#A5B4FC' : '#2F5BFF',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: isLoading || otpCode.length < 6 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(47,91,255,0.3)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Sign in</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ============================================================ */
          /* MODE 2: PASSWORD AUTHENTICATION */
          /* ============================================================ */
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '15px',
                  color: '#0E1530',
                  background: '#F6F8FC',
                  border: '1px solid #C9D0E0',
                  borderRadius: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label htmlFor="password" style={{ fontSize: '14px', fontWeight: 600, color: '#0E1530' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMode('otp')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#2F5BFF',
                    cursor: 'pointer',
                  }}
                >
                  Use OTP instead
                </button>
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
                    height: '48px',
                    padding: '0 50px 0 16px',
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

            {/* Demo Shortcut */}
            <button
              type="button"
              onClick={handleUseDemo}
              style={{
                height: '36px',
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
            >
              Auto-fill Demo Account (demo@folio.ai)
            </button>
          </form>
        )}

        {/* Footer Link */}
        <p style={{ margin: 0, textAlign: 'center', fontSize: '14px', color: '#5B6478' }}>
          New here?{' '}
          <Link href="/register" style={{ color: '#2F5BFF', fontWeight: 700, textDecoration: 'none' }}>
            Create an account
          </Link>
        </p>
      </div>

      {/* Security Badge */}
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
        <ShieldCheck size={16} />
        <span>Supabase PostgreSQL + JWT End-to-End Encryption</span>
      </div>
    </div>
  );
}
