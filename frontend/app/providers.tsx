'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthSession, UserRole, AuthContextType } from '@/lib/types';
import { supabase } from '@/lib/supabase';

/**
 * AuthProvider — Production Supabase Auth
 *
 * Manages real authentication sessions via Supabase Auth.
 * On login, auto-detects user role by checking which table
 * (restaurants/volunteers/ngos/admins) has a matching row.
 */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Role Detection ─────────────────────────────────────────
  const detectUserRole = useCallback(async (userId: string, email: string): Promise<{
    role: UserRole;
    profile: Record<string, any>;
  }> => {
    const [
      adminByEmailRes,
      adminByIdRes,
      restaurantRes,
      volunteerRes,
      ngoRes
    ] = await Promise.allSettled([
      supabase.from('admins').select('id, email, name').eq('email', email).maybeSingle(),
      supabase.from('admins').select('id, email, name').eq('id', userId).maybeSingle(),
      supabase.from('restaurants').select('*').eq('id', userId).maybeSingle(),
      supabase.from('volunteers').select('*').eq('id', userId).maybeSingle(),
      supabase.from('ngos').select('*').eq('id', userId).maybeSingle()
    ]);

    // Admin by Email
    if (adminByEmailRes.status === 'fulfilled' && adminByEmailRes.value.data) {
      return {
        role: 'admin',
        profile: { name: adminByEmailRes.value.data.name || 'Admin', phone: '', points: 0, green_score: 100 },
      };
    }
    // Admin by ID
    if (adminByIdRes.status === 'fulfilled' && adminByIdRes.value.data) {
      return {
        role: 'admin',
        profile: { name: adminByIdRes.value.data.name || 'Admin', phone: '', points: 0, green_score: 100 },
      };
    }
    // Restaurant
    if (restaurantRes.status === 'fulfilled' && restaurantRes.value.data) {
      return {
        role: 'donor',
        profile: {
          name: restaurantRes.value.data.name || '',
          phone: restaurantRes.value.data.phone || '',
          address: restaurantRes.value.data.address || '',
          points: restaurantRes.value.data.green_points || 0,
          green_score: restaurantRes.value.data.green_points || 0,
        },
      };
    }
    // Volunteer
    if (volunteerRes.status === 'fulfilled' && volunteerRes.value.data) {
      return {
        role: 'volunteer',
        profile: {
          name: volunteerRes.value.data.name || '',
          phone: volunteerRes.value.data.phone || '',
          points: volunteerRes.value.data.green_points || 0,
          green_score: volunteerRes.value.data.green_points || 0,
        },
      };
    }
    // NGO
    if (ngoRes.status === 'fulfilled' && ngoRes.value.data) {
      return {
        role: 'ngo',
        profile: {
          name: ngoRes.value.data.name || '',
          phone: ngoRes.value.data.phone || '',
          address: ngoRes.value.data.address || '',
          organization_name: ngoRes.value.data.name || '',
          points: 0,
          green_score: 0,
        },
      };
    }

    console.error(`[Auth] No profile found for user ${userId} (${email}) in any role table.`);
    throw new Error('No profile found in role tables. User registration incomplete.');
  }, []);

  // ── Build Session from Supabase Auth ───────────────────────
  const buildSession = useCallback(async (
    supabaseSession: { access_token: string; refresh_token: string; user: { id: string; email?: string } }
  ): Promise<AuthSession> => {
    const { role, profile } = await detectUserRole(
      supabaseSession.user.id,
      supabaseSession.user.email || ''
    );

    const user: User = {
      id: supabaseSession.user.id,
      role,
      name: profile.name,
      email: supabaseSession.user.email || '',
      phone: profile.phone || '',
      verified_status: 'verified',
      points: profile.points || 0,
      green_score: profile.green_score || 0,
      created_at: new Date().toISOString(),
      address: profile.address,
      organization_name: profile.organization_name,
    };

    return {
      user,
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token,
    };
  }, [detectUserRole]);

  // ── Initialize: Restore Session on Mount ───────────────────
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth init timeout')), 10000));

        // Race the session lookup against a 10s timeout just in case it hangs
        const { data: { session: supabaseSession } } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]) as { data: { session: any } };

        if (supabaseSession && mounted) {
          const appSession = await buildSession(supabaseSession);
          if (mounted) setSession(appSession);
        }
      } catch (error) {
        console.error('[Auth] Failed to restore session during reload:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !supabaseSession) {
          setSession(null);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            const appSession = await buildSession(supabaseSession);
            setSession(appSession);
          } catch (error) {
            console.error('[Auth] Session build failed:', error);
            setSession(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [buildSession]);

  // ── Login ──────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error('Login succeeded but no session was returned.');
      }

      // Session will be set by onAuthStateChange listener
      // But we also build it immediately for faster UI response
      const appSession = await buildSession(data.session);
      setSession(appSession);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Signup ─────────────────────────────────────────────────
  const signup = async (
    email: string,
    password: string,
    role: UserRole,
    name: string,
    phone?: string,
    address?: string,
  ) => {
    setIsLoading(true);
    try {
      // Step 1: Create auth user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, name }, // Stored in user_metadata
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Signup failed — no user was returned.');
      }

      const userId = data.user.id;

      // Step 2: Insert into the role-specific table
      const roleTableMap: Record<string, string> = {
        donor: 'restaurants',
        volunteer: 'volunteers',
        ngo: 'ngos',
      };

      const tableName = roleTableMap[role];
      if (!tableName) {
        throw new Error(`Invalid role "${role}" for registration.`);
      }

      // Build the insert payload based on role
      let insertPayload: Record<string, any> = { id: userId, name };

      if (role === 'donor') {
        insertPayload = {
          id: userId,
          name,
          address: address || '',
          phone: phone || '',
        };
      } else if (role === 'volunteer') {
        insertPayload = {
          id: userId,
          name,
          phone: phone || '',
          is_available: true,
          green_points: 0,
          approval_status: 'PENDING',
        };
      } else if (role === 'ngo') {
        insertPayload = {
          id: userId,
          name,
          address: address || '',
          phone: phone || '',
        };
      }

      const { error: insertError } = await supabase
        .from(tableName)
        .insert(insertPayload);

      if (insertError) {
        // Rollback: if profile insert fails, we should clean up
        // but Supabase doesn't allow deleting auth users from client
        console.error('[Auth] Profile insert failed:', insertError);
        throw new Error(
          `Account created but profile setup failed: ${insertError.message}. ` +
          'Please contact support.'
        );
      }

      // If we have a session (email confirmation disabled), build it
      if (data.session) {
        const appSession = await buildSession(data.session);
        setSession(appSession);
      }
      // If email confirmation is enabled, data.session will be null
      // and user needs to verify email first
    } finally {
      setIsLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        accessToken: session?.accessToken || null,
        login,
        signup,
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
