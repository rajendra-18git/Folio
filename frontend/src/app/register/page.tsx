'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to workspace
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/workspace');
    }
  }, [isAuthenticated, router]);

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (val: string) => {
    const v = val.trim();
    if (!v) {
      setEmailError('Enter your email address.');
      return false;
    }
    if (!emailRe.test(v)) {
      setEmailError('Enter a valid email address, like name@example.com.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Enter a password.');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Use at least 6 characters.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirm = (val: string, originalPw: string) => {
    if (!val) {
      setConfirmError('Repeat your password.');
      return false;
    }
    if (val !== originalPw) {
      setConfirmError('Passwords don’t match.');
      return false;
    }
    setConfirmError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    const isEmailValid = validateEmail(email);
    const isPwValid = validatePassword(password);
    const isConfirmValid = validateConfirm(confirmPassword, password);

    if (!isEmailValid || !isPwValid || !isConfirmValid) {
      return;
    }

    try {
      setIsLoading(true);
      await register(email.trim(), password, fullName.trim() || undefined);
      router.push('/workspace');
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="folio-auth-scope">
      {/* Google Fonts Preconnect & Styles */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Sora:wght@600;700&display=swap"
      />

      <style jsx global>{`
        .folio-auth-scope {
          --brand: #2F5BFF;
          --brand-deep: #1C3FCF;
          --ink: #0E1530;
          --text: #3A4258;
          --muted: #5B6478;
          --line: #E3E8F3;
          --bg: #F4F7FC;
          --tint: #EAF0FF;
          --green: #0B6B43;
          --green-bg: #E7F6EE;
        }

        .folio-auth-scope {
          font-family: 'Figtree', 'Helvetica Neue', Arial, sans-serif;
          color: var(--ink);
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .folio-auth-scope h1,
        .folio-auth-scope h2,
        .folio-auth-scope h3 {
          font-family: 'Sora', 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .folio-auth-scope .auth-blue {
          min-height: 100vh;
          padding: 40px 24px;
          background: var(--brand);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
          justify-content: center;
        }

        .folio-auth-scope .art {
          position: absolute;
          pointer-events: none;
        }

        .folio-auth-scope .back-link {
          position: absolute;
          left: 32px;
          top: 24px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 44px;
          padding: 0 8px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
        }
        .folio-auth-scope .back-link:hover {
          text-decoration: underline;
          text-underline-offset: 5px;
        }

        .folio-auth-scope .auth-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          padding: 40px;
          background: #fff;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          box-shadow: 0 25px 60px rgba(14, 21, 48, 0.22);
          z-index: 10;
        }

        .folio-auth-scope .auth-card .head {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .folio-auth-scope .auth-title {
          font-size: 28px;
          line-height: 1.15;
          font-weight: 700;
          color: var(--ink);
        }

        .folio-auth-scope .auth-sub {
          margin-top: 6px;
          font-size: 15px;
          line-height: 1.5;
          color: var(--muted);
        }

        .folio-auth-scope .form-stack {
          display: flex;
          flex-direction: column;
        }

        .folio-auth-scope .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .folio-auth-scope .field label {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }

        .folio-auth-scope .req {
          color: #D92D4A;
          margin-left: 2px;
        }

        .folio-auth-scope .opt {
          font-weight: 500;
          color: var(--muted);
        }

        .folio-auth-scope .hint {
          font-size: 13px;
          color: var(--muted);
        }

        .folio-auth-scope .input-wrap {
          position: relative;
        }

        .folio-auth-scope .input-wrap .lead {
          position: absolute;
          left: 14px;
          top: 15px;
          pointer-events: none;
        }

        .folio-auth-scope .input {
          width: 100%;
          height: 50px;
          padding: 0 16px;
          font: inherit;
          font-size: 16px;
          color: var(--ink);
          background: #F6F8FC;
          border: 1px solid #C9D0E0;
          border-radius: 12px;
          box-sizing: border-box;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .folio-auth-scope .input:focus {
          outline: 2px solid var(--brand);
          outline-offset: 0;
          border-color: var(--brand);
          background: #fff;
        }

        .folio-auth-scope .input::placeholder {
          color: #7A8499;
        }

        .folio-auth-scope .input.has-lead {
          padding-left: 44px;
        }

        .folio-auth-scope .input.has-trail {
          padding-right: 52px;
        }

        .folio-auth-scope .input-wrap .trail {
          position: absolute;
          right: 4px;
          top: 3px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 0;
          border-radius: 10px;
          cursor: pointer;
        }
        .folio-auth-scope .input-wrap .trail:hover {
          background: #eef2fa;
        }

        .folio-auth-scope .field.invalid .input {
          border-color: #D92D4A;
          background: #FFF7F8;
        }

        .folio-auth-scope .field.invalid .input:focus {
          outline-color: #D92D4A;
        }

        .folio-auth-scope .field-error {
          font-size: 13px;
          font-weight: 600;
          color: #C0262D;
          display: block;
        }

        .folio-auth-scope .api-error-banner {
          padding: 12px 14px;
          background: #FFF1F3;
          border: 1px solid #FBC0C8;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #C0262D;
          margin-bottom: 4px;
        }

        .folio-auth-scope .btn-submit {
          height: 52px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          background: var(--brand);
          border: 0;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.18s ease;
        }
        .folio-auth-scope .btn-submit:hover:not(:disabled) {
          background: var(--brand-deep);
        }
        .folio-auth-scope .btn-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .folio-auth-scope .auth-sep {
          border: 0;
          border-top: 1px solid #E3E8F3;
          margin: 0;
        }

        .folio-auth-scope .auth-foot {
          text-align: center;
          font-size: 15px;
          color: var(--muted);
          margin: 0;
        }

        .folio-auth-scope .auth-foot a {
          font-weight: 700;
          color: var(--brand-deep);
          text-decoration: none;
        }
        .folio-auth-scope .auth-foot a:hover {
          text-decoration: underline;
        }

        .folio-auth-scope .secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          color: #fff;
          z-index: 10;
        }

        @media (max-width: 520px) {
          .folio-auth-scope .back-link {
            left: 12px;
            top: 12px;
          }
          .folio-auth-scope .auth-blue {
            padding-top: 72px;
            padding-left: 16px;
            padding-right: 16px;
          }
          .folio-auth-scope .auth-card {
            padding: 28px 20px;
          }
        }
      `}</style>

      <div className="auth-blue">
        {/* Decorative Background Art SVGs */}
        <svg
          className="art"
          aria-hidden="true"
          width="420"
          height="420"
          viewBox="0 0 120 120"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.35"
          strokeWidth="0.8"
          style={{ left: '-90px', top: '120px', transform: 'rotate(-12deg)' }}
        >
          <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" />
          <path d="M72 8V38H102" />
          <path d="M38 52H80M38 66H80M38 80H64" />
        </svg>

        <svg
          className="art"
          aria-hidden="true"
          width="480"
          height="480"
          viewBox="0 0 120 120"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.35"
          strokeWidth="0.8"
          style={{ right: '-110px', bottom: '-80px', transform: 'rotate(10deg)' }}
        >
          <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" />
          <path d="M72 8V38H102" />
          <path d="M38 52H80M38 66H80M38 80H64" />
        </svg>

        {/* Back Link to Landing */}
        <Link href="/" className="back-link">
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M11 6l-6 6 6 6" />
          </svg>
          Back to Folio
        </Link>

        {/* Auth Card */}
        <main className="auth-card">
          <div className="head">
            {/* Folio Logo Mark */}
            <svg role="img" aria-label="Folio logo mark" width="56" height="56" viewBox="0 0 120 120">
              <path d="M32 8H72L102 38V98A14 14 0 0 1 88 112H32A14 14 0 0 1 18 98V22A14 14 0 0 1 32 8Z" fill="#2F5BFF" />
              <path d="M72 8V38H102Z" fill="#1C3FCF" />
              <rect x="38" y="48" width="12" height="50" rx="3" fill="#fff" />
              <rect x="38" y="48" width="38" height="12" rx="3" fill="#fff" />
              <rect x="38" y="70" width="26" height="11" rx="3" fill="#fff" />
            </svg>
            <div>
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-sub">Get started with AI-powered document intelligence and study notes.</p>
            </div>
          </div>

          <form id="signupForm" className="form-stack" style={{ gap: '28px' }} onSubmit={handleSubmit} noValidate>
            <div className="form-stack" style={{ gap: '18px' }}>
              {apiError && (
                <div className="api-error-banner" role="alert">
                  {apiError}
                </div>
              )}

              {/* Full Name Field */}
              <div className="field">
                <label htmlFor="name">
                  Full name <span className="opt">(optional)</span>
                </label>
                <div className="input-wrap">
                  <svg
                    className="lead"
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
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                  <input
                    className="input has-lead"
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Rivera"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className={`field ${emailError ? 'invalid' : ''}`}>
                <label htmlFor="email">
                  Email address <span className="req" aria-hidden="true">*</span>
                </label>
                <div className="input-wrap">
                  <svg
                    className="lead"
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
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <path d="M4 7l8 6 8-6" />
                  </svg>
                  <input
                    className="input has-lead"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
                    aria-describedby="emailErr"
                    aria-invalid={!!emailError}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail(e.target.value);
                    }}
                    onBlur={(e) => validateEmail(e.target.value)}
                  />
                </div>
                {emailError && (
                  <div className="field-error" id="emailErr" role="alert">
                    {emailError}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className={`field ${passwordError ? 'invalid' : ''}`}>
                <label htmlFor="password">
                  Password <span className="req" aria-hidden="true">*</span>
                </label>
                <div className="input-wrap">
                  <svg
                    className="lead"
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
                    <rect x="4" y="10" width="16" height="10" rx="3" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <input
                    className="input has-lead has-trail"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    required
                    aria-describedby="pwHint pwErr"
                    aria-invalid={!!passwordError}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) validatePassword(e.target.value);
                      if (confirmPassword) validateConfirm(confirmPassword, e.target.value);
                    }}
                    onBlur={(e) => validatePassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="trail pw-toggle"
                    data-target="password"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {!showPassword ? (
                      <svg
                        className="eye-on"
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
                    ) : (
                      <svg
                        className="eye-off"
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
                    )}
                  </button>
                </div>
                {!passwordError && (
                  <div className="hint" id="pwHint">
                    Use 6 or more characters.
                  </div>
                )}
                {passwordError && (
                  <div className="field-error" id="pwErr" role="alert">
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className={`field ${confirmError ? 'invalid' : ''}`}>
                <label htmlFor="password2">
                  Confirm password <span className="req" aria-hidden="true">*</span>
                </label>
                <div className="input-wrap">
                  <svg
                    className="lead"
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
                    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6Z" />
                    <path d="M9 12l2.2 2.2L15.5 10" />
                  </svg>
                  <input
                    className="input has-lead has-trail"
                    id="password2"
                    name="password2"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    required
                    aria-describedby="pw2Err"
                    aria-invalid={!!confirmError}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) validateConfirm(e.target.value, password);
                    }}
                    onBlur={(e) => validateConfirm(e.target.value, password)}
                  />
                  <button
                    type="button"
                    className="trail pw-toggle"
                    data-target="password2"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {!showConfirmPassword ? (
                      <svg
                        className="eye-on"
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
                    ) : (
                      <svg
                        className="eye-off"
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
                    )}
                  </button>
                </div>
                {confirmError && (
                  <div className="field-error" id="pw2Err" role="alert">
                    {confirmError}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create free account</span>
                  <svg
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
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
          </form>

          <hr className="auth-sep" />
          <p className="auth-foot">
            Already have an account? <Link href="/login">Sign in here</Link>
          </p>
        </main>

        {/* Security Badge */}
        <div className="secure">
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
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
    </div>
  );
}
