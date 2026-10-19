'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocuMindLogo } from '@/components/DocuMindLogo';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Lock, Mail, User as UserIcon, ArrowRight, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/workspace');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      await register(email, password, fullName || undefined);
      router.push('/workspace');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#040914] text-white'
    }`}>
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />

      {/* Top Bar with Back to Home */}
      <div className="absolute top-6 left-6 sm:left-12 z-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-sky-600 transition">
          <span className="text-base">←</span> Back to Folio
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Folio Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="inline-block transform hover:scale-105 transition duration-200 mb-3">
            <DocuMindLogo size={46} showText={true} />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Create your account
          </h2>
          <p className={`mt-2 text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Get started with AI-powered document intelligence & study notes
          </p>
        </div>

        {/* Main Card */}
        <div className={`rounded-2xl p-8 sm:p-10 border shadow-2xl backdrop-blur-xl transition-all ${
          isLight
            ? 'bg-white/90 border-slate-200/80 shadow-[0_20px_50px_rgba(2,132,199,0.08)]'
            : 'bg-[#081226]/80 border-sky-900/30 shadow-[0_25px_60px_rgba(0,0,0,0.7)]'
        }`}>
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3">
              <span className="font-semibold text-rose-500 mt-0.5">!</span>
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Full Name (Optional)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  className={`block w-full pl-10 pr-4 py-2.5 sm:text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-sky-500/50 ${
                    isLight
                      ? 'bg-slate-50/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500'
                      : 'bg-[#040914]/60 border-slate-700/60 text-white placeholder-slate-500 focus:bg-[#040914] focus:border-sky-400'
                  }`}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`block w-full pl-10 pr-4 py-2.5 sm:text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-sky-500/50 ${
                    isLight
                      ? 'bg-slate-50/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500'
                      : 'bg-[#040914]/60 border-slate-700/60 text-white placeholder-slate-500 focus:bg-[#040914] focus:border-sky-400'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={`block w-full pl-10 pr-10 py-2.5 sm:text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-sky-500/50 ${
                    isLight
                      ? 'bg-slate-50/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500'
                      : 'bg-[#040914]/60 border-slate-700/60 text-white placeholder-slate-500 focus:bg-[#040914] focus:border-sky-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className={`block w-full pl-10 pr-4 py-2.5 sm:text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-sky-500/50 ${
                    isLight
                      ? 'bg-slate-50/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500'
                      : 'bg-[#040914]/60 border-slate-700/60 text-white placeholder-slate-500 focus:bg-[#040914] focus:border-sky-400'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white prism-blue-gradient shadow-lg shadow-sky-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className={`mt-6 pt-5 border-t text-xs text-center ${isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
            <span>Already have an account? </span>
            <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-500 transition">
              Sign in here
            </Link>
          </div>
        </div>

        {/* Security Trust Badge */}
        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Private, Isolated Document Vector Stores & Grounded RAG</span>
        </div>
      </div>
    </div>
  );
}
