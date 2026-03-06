'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { BountyBoard } from '@/components/bounty-board';
import { ActiveTasks } from '@/components/active-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db_mock';
import { Leaf, Zap, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VolunteerDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'volunteer') {
      router.push('/');
      return;
    }

    if (user) {
      const userStats = db.getUserStats(user.id);
      setStats(userStats);
      // Get all available and assigned donations for this volunteer
      const allDonations = db.getActiveDonations();
      setDonations(allDonations);
    }
  }, [user, isAuthenticated, isLoading, router]);

  const handleAcceptDelivery = (donationId: string) => {
    // Simulate accepting delivery
    console.log('[v0] Delivery accepted:', donationId);
  };

  const handleCompleteTask = (donationId: string) => {
    // Simulate completing delivery
    console.log('[v0] Delivery completed:', donationId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Leaf className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Loading your bounty board...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'volunteer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Welcome, {user.name}!</h1>
              <p className="text-muted-foreground mt-2">Your Bounty Board is ready</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Deliveries Completed */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {donations.filter(d => d.status === 'delivered' && d.volunteer_id === user.id).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </CardContent>
            </Card>

            {/* Active Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-secondary" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">
                  {donations.filter(d => (d.status === 'assigned' || d.status === 'picked') && d.volunteer_id === user.id).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Tasks</p>
              </CardContent>
            </Card>

            {/* Green Points */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Green Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.points || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Earned</p>
              </CardContent>
            </Card>

            {/* Rank */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-secondary" />
                  Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{stats?.totalDonated || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">kg delivered</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Bounty Board */}
          <div className="lg:col-span-2">
            <BountyBoard donations={donations} onAccept={handleAcceptDelivery} />
          </div>

          {/* Right: Active Tasks */}
          <div className="lg:col-span-1">
            <ActiveTasks
              donations={donations}
              onComplete={handleCompleteTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
