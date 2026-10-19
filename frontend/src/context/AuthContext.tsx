'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthTokenResponse, SendOtpResponse } from '../lib/types';
import { api, getStoredToken, setStoredToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthTokenResponse>;
  register: (email: string, password: string, fullName?: string) => Promise<AuthTokenResponse>;
  sendOtp: (email: string, purpose?: 'login' | 'register') => Promise<SendOtpResponse>;
  loginWithOtp: (email: string, otpCode: string) => Promise<AuthTokenResponse>;
  registerWithOtp: (email: string, password: string, otpCode: string, fullName?: string) => Promise<AuthTokenResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from storage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = getStoredToken();
        if (stored) {
          setToken(stored);
          try {
            const userData = await api.auth.getMe();
            setUser(userData);
          } catch (err) {
            console.warn('Session expired or invalid token:', err);
            api.auth.logout();
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthTokenResponse> => {
    setIsLoading(true);
    try {
      const response = await api.auth.login({ email, password });
      setToken(response.access_token);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string): Promise<AuthTokenResponse> => {
    setIsLoading(true);
    try {
      const response = await api.auth.register({ email, password, full_name: fullName });
      setToken(response.access_token);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (email: string, purpose: 'login' | 'register' = 'login'): Promise<SendOtpResponse> => {
    return api.auth.sendOtp({ email, purpose });
  };

  const loginWithOtp = async (email: string, otpCode: string): Promise<AuthTokenResponse> => {
    setIsLoading(true);
    try {
      const response = await api.auth.verifyOtpLogin({ email, otp_code: otpCode });
      setToken(response.access_token);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithOtp = async (
    email: string,
    password: string,
    otpCode: string,
    fullName?: string
  ): Promise<AuthTokenResponse> => {
    setIsLoading(true);
    try {
      const response = await api.auth.registerWithOtp({
        email,
        password,
        otp_code: otpCode,
        full_name: fullName,
      });
      setToken(response.access_token);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await api.auth.getMe();
      setUser(userData);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        sendOtp,
        loginWithOtp,
        registerWithOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
