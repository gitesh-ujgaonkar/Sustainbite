'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { DonationForm } from '@/components/donation-form';
import { DonationLogs } from '@/components/donation-logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db_mock';
import { supabase } from '@/lib/supabase';
import { Leaf, Trophy, TrendingUp, Award, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRealtimeDeliveries } from '@/hooks/useRealtimeDeliveries';

export default function DonorDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'donor') {
      router.push('/');
      return;
    }

    if (user) {
      const fetchStats = async () => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        
        try {
          const res = await fetch(`${API_BASE}/api/v1/stats/restaurants/me`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          });
          if (res.ok) {
            const data = await res.json();
            setStats({
              totalDonated: data.total_kg,
              deliveredCount: data.total_deliveries,
              points: data.total_points,
              certificates: []
            });
          }
        } catch (err) {
          console.error('[Donor] Failed to fetch stats', err);
        } finally {
          setStatsLoading(false);
        }
      };
      
      fetchStats();
      const fetchDonations = async () => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        
        try {
          const res = await fetch(`${API_BASE}/api/v1/deliveries/me`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          });
          if (res.ok) {
            const data = await res.json();
            setDonations(data.deliveries || []);
          }
        } catch (err) {
          console.error('[Donor] Failed to fetch donations', err);
        }
      };
      
      fetchDonations();
    }
  }, [user, isAuthenticated, isLoading, router]);

  // ── Supabase Realtime Hook ──────────────────────────────────
  useRealtimeDeliveries({
    enabled: isAuthenticated && user?.role === 'donor',
    onInsert: (payload) => {
      const newDelivery = payload.new;
      // Note: We already optimistically insert it on submit.
      // But just in case they have multiple windows open:
      if (newDelivery.restaurant_id === user?.id) {
        setDonations((prev) => {
          if (prev.some(d => d.id === newDelivery.id)) return prev;
          return [newDelivery, ...prev];
        });
      }
    },
    onUpdate: (payload) => {
      const updatedDelivery = payload.new;
      // Find the specific task and update it inline, so the Status Badge snaps cleanly
      if (updatedDelivery.restaurant_id === user?.id) {
        setDonations((prev) => prev.map(d => 
          d.id === updatedDelivery.id ? { ...d, ...updatedDelivery } : d
        ));
      }
    },
    onDelete: (payload) => {
      const deletedId = payload.old.id;
      setDonations((prev) => prev.filter(d => d.id !== deletedId));
    }
  });

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

  if (!isAuthenticated || !user || user.role !== 'donor') {
    return null;
  }

  const nextMilestone = [
    { kg: 50, name: 'Bronze Contributor' },
    { kg: 100, name: 'Silver Champion' },
    { kg: 250, name: 'Gold Hero' },
    { kg: 500, name: 'Platinum Legend' },
  ].find(m => m.kg > (stats?.totalDonated || 0)) || { kg: 500, name: 'Platinum Legend' };

  const progressPercent = ((stats?.totalDonated || 0) / nextMilestone.kg) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Welcome, {user.name}!</h1>
              <p className="text-muted-foreground mt-2">Track your donations and impact</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Donated */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  Total Donated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : (stats?.totalDonated || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">kg of food</p>
              </CardContent>
            </Card>

            {/* Green Points */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  Green Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">
                  {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : (stats?.points || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Earned</p>
              </CardContent>
            </Card>

            {/* Deliveries */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : (stats?.deliveredCount || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-orange-500" />
                  Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.certificates?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Earned</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Milestone */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Next Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{nextMilestone.name}</span>
                <span className="text-sm text-muted-foreground">
                  {statsLoading ? '...' : (stats?.totalDonated || 0)} / {nextMilestone.kg} kg
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.max(0, nextMilestone.kg - (stats?.totalDonated || 0))} kg more to earn this badge!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-1">
            <DonationForm onSubmit={(newDonation) => {
              if (newDonation) {
                setDonations(prev => [newDonation, ...prev]);
              }
            }} />
          </div>

          {/* Right: Logs */}
          <div className="lg:col-span-2">
            <DonationLogs donations={donations} />
          </div>
        </div>
      </div>
    </div>
  );
}
