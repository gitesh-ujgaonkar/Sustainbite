'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { BountyBoard } from '@/components/bounty-board';
import { ActiveTasks } from '@/components/active-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db } from '@/lib/db_mock';
import { Leaf, Zap, Trophy, TrendingUp, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VolunteerDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);

  // Simulated approval status — in production, this would come from
  // a GET /api/v1/volunteers/{id}/status call to the backend
  const [approvalStatus, setApprovalStatus] = useState<string>('PENDING');
  const isPendingVerification = approvalStatus === 'PENDING';
  const isBanned = approvalStatus === 'BANNED';
  const isRejected = approvalStatus === 'REJECTED';

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
      const allDonations = db.getActiveDonations();
      setDonations(allDonations);

      // In production: fetch approval status from backend
      // fetch(`/api/v1/volunteers/${user.id}/status`)
      //   .then(res => res.json())
      //   .then(data => setApprovalStatus(data.approval_status));

      // For demo, simulate APPROVED for existing mock users
      setApprovalStatus('APPROVED');
    }
  }, [user, isAuthenticated, isLoading, router]);

  const handleAcceptDelivery = (donationId: string) => {
    if (isPendingVerification || isBanned || isRejected) return;
    console.log('[v0] Delivery accepted:', donationId);
  };

  const handleCompleteTask = (donationId: string) => {
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
        {/* ── KYC Verification Banners ────────────────────── */}
        {isPendingVerification && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Account Under Review —</span>{' '}
              Your identity verification is being reviewed by an Administrator.
              You cannot accept new delivery tasks until your ID is verified.
              This usually takes 24–48 hours.
            </AlertDescription>
          </Alert>
        )}

        {isRejected && (
          <Alert className="mb-6 border-red-500/50 bg-red-50 dark:bg-red-950/30" variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <span className="font-semibold">Verification Rejected —</span>{' '}
              Your identity document was not accepted. Please re-upload a valid
              government-issued ID and contact support if you believe this is an error.
            </AlertDescription>
          </Alert>
        )}

        {isBanned && (
          <Alert className="mb-6 border-red-500/50 bg-red-50 dark:bg-red-950/30" variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <span className="font-semibold">Account Suspended —</span>{' '}
              Your account has been suspended by an administrator.
              Please contact support for more information.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Welcome, {user.name}!</h1>
              <p className="text-muted-foreground mt-2">
                {isPendingVerification
                  ? 'Complete your verification to start accepting deliveries'
                  : 'Your Bounty Board is ready'}
              </p>
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
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isPendingVerification || isBanned ? 'opacity-50 pointer-events-none' : ''}`}>
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
