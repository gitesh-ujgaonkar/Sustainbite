'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/lib/types';
import { Leaf, Mail, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('donor');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // For demo: use any email with password "password"
      // Real users:
      // Donor: manager@pizzapalace.com
      // Volunteer: marcus@example.com
      // NGO: contact@hopecenter.org
      // Admin: admin@sustainbite.com
      await login(email, 'password', role);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

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
                <Label htmlFor="role">I'm a</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">Donor/Restaurant</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="ngo">NGO/Organization</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    placeholder="For demo: 'password'"
                    defaultValue="password"
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold">Demo Accounts:</p>
              <ul className="space-y-1 text-xs">
                <li>Donor: manager@pizzapalace.com</li>
                <li>Volunteer: marcus@example.com</li>
                <li>NGO: contact@hopecenter.org</li>
                <li>Admin: admin@sustainbite.com</li>
              </ul>
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
