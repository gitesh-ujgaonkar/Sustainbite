'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserRole } from '@/lib/types';

// ── Role → Dashboard Route Map ──────────────────────────────
const DASHBOARD_ROUTES: Record<UserRole, string> = {
  donor: '/dashboard/donor',
  volunteer: '/dashboard/volunteer',
  ngo: '/dashboard/ngo',
  admin: '/dashboard/admin',
};

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      await login(email, password);

      // After login, user.role is set by the auth provider's role detection.
      // We need to read it from the updated session — the login() function
      // in providers.tsx builds the session synchronously after signIn.
      // However, React state update is async, so we get the role from the
      // provider by waiting a tick for the state to propagate.
      setIsRedirecting(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';

      // Map common Supabase errors to user-friendly messages
      if (message.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (message.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email address before logging in. Check your inbox.');
      } else {
        setError(message);
      }
    }
  };

  // ── Smart Redirect After Login ─────────────────────────────
  // Once the auth state updates with the user's role (or if already logged in), redirect
  React.useEffect(() => {
    // If the user is already authenticated and we have their role, push them to the dashboard
    if (user?.role && !isLoading) {
      const dashboardRoute = DASHBOARD_ROUTES[user.role] || '/';
      router.push(dashboardRoute);
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Leaf className="h-6 w-6" />
            SustainBite
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your SustainBite account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Your role is detected automatically based on your registered profile.</p>
            </div>

            <div className="mt-4 text-center text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-semibold">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
