'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, signup as apiSignup, getMe } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (studentId: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, studentId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (storedToken: string) => {
    try {
      const userData = await getMe(storedToken);
      setUser(userData);
      setToken(storedToken);
    } catch {
      localStorage.removeItem('foundit_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('foundit_token');
    if (storedToken) {
      loadUser(storedToken);
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const login = async (studentId: string, password: string) => {
    const data = await apiLogin({ studentId, password });
    localStorage.setItem('foundit_token', data.token);
    setToken(data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, studentId: data.studentId });
  };

  const signup = async (name: string, email: string, password: string, studentId: string) => {
    const data = await apiSignup({ name, email, password, studentId });
    localStorage.setItem('foundit_token', data.token);
    setToken(data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, studentId: data.studentId });
  };

  const logout = () => {
    localStorage.removeItem('foundit_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
