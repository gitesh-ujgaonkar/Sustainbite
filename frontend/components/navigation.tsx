'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Leaf, LogOut, Settings, Home, Award, Trophy } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();

  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'donor':
        return '/dashboard/donor';
      case 'volunteer':
        return '/dashboard/volunteer';
      case 'ngo':
        return '/dashboard/ngo';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/';
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Leaf className="h-6 w-6" />
          <span className="hidden sm:inline">SustainBite</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link href="/leaderboard" className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-700 transition-colors mr-2">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              <Link href={getDashboardRoute()} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardRoute()}>
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/certificates">
                      <Award className="mr-2 h-4 w-4" />
                      Certificates
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/leaderboard" className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-700 transition-colors mr-2">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
