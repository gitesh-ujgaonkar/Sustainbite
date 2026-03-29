'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { HungerStatusToggle } from '@/components/hunger-status-toggle';
import { IncomingDonations } from '@/components/incoming-donations';
import { OTPDisplay } from '@/components/otp-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db_mock';
import { HungerStatus } from '@/lib/types';
import { Leaf, Users, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NGODashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hungerStatus, setHungerStatus] = useState<HungerStatus>('open');
  const [donations, setDonations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'ngo') {
      router.push('/');
      return;
    }

    if (user) {
      // Get NGO request
      const ngoRequest = db.getNGORequestByNGOId(user.id);
      if (ngoRequest) {
        setHungerStatus(ngoRequest.hunger_status);
      }

      // Get incoming donations for this NGO
      const allDonations = db.getActiveDonations();
      const incomingDonations = allDonations.filter(
        d => (d.status === 'assigned' || d.status === 'picked') && d.ngo_id === user.id
      );
      setDonations(incomingDonations);

      const userStats = db.getUserStats(user.id);
      setStats(userStats);
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Leaf className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'ngo') {
    return null;
  }

  const ngoRequest = db.getNGORequestByNGOId(user.id);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Welcome, {user.name}!</h1>
              <p className="text-muted-foreground mt-2">Manage your organization's food needs</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* People Served */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  People Served
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {ngoRequest?.people_count || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Monthly capacity</p>
              </CardContent>
            </Card>

            {/* Total Received */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-secondary" />
                  Total Received
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">125</div>
                <p className="text-xs text-muted-foreground mt-1">kg this month</p>
              </CardContent>
            </Card>

            {/* Incoming */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Incoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{donations.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active deliveries</p>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-secondary" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hungerStatus === 'critical' && '🔴'}
                  {hungerStatus === 'open' && '🟡'}
                  {hungerStatus === 'full' && '🟢'}
                </div>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {hungerStatus === 'critical' ? 'Critical' : hungerStatus === 'open' ? 'Accepting' : 'Full'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Status & OTP */}
          <div className="lg:col-span-1 space-y-6">
            <HungerStatusToggle
              currentStatus={hungerStatus}
              onChange={setHungerStatus}
              peopleCount={ngoRequest?.people_count || 0}
            />

            {/* Show OTP when receiving donations */}
            {donations.length > 0 && (
              <OTPDisplay currentOTP="7842" expiresIn={420} />
            )}
          </div>

          {/* Right Column: Incoming Donations */}
          <div className="lg:col-span-2">
            <IncomingDonations donations={donations} />
          </div>
        </div>
      </div>
    </div>
  );
}
