'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthSession, UserRole } from '@/lib/types';
import { db, mockUsers } from '@/lib/db_mock';

interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('sustainbite_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.expiresAt > Date.now()) {
          setSession(parsed);
        } else {
          localStorage.removeItem('sustainbite_session');
        }
      } catch (error) {
        console.error('[v0] Failed to restore session:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find user by email and role
      const user = Object.values(mockUsers).find(
        u => u.email === email && u.role === role
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Create session (in real app, would use secure token)
      const newSession: AuthSession = {
        user,
        token: `token_${user.id}_${Date.now()}`,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      setSession(newSession);
      localStorage.setItem('sustainbite_session', JSON.stringify(newSession));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('sustainbite_session');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        login,
        logout,
        isLoading,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
