'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Navigation } from '@/components/navigation';
import { BountyBoard } from '@/components/bounty-board';
import { ActiveTasks } from '@/components/active-tasks';
import { VolunteerKYCUpload } from '@/components/volunteer-kyc-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db } from '@/lib/db_mock';
import {
  Leaf, Zap, Trophy, TrendingUp, ShieldAlert, ShieldCheck,
  ShieldX, Ban, Upload, Clock,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Volunteer profile from Supabase
interface VolunteerProfile {
  id: string;
  name: string;
  approval_status: string;
  id_document_url: string | null;
  green_points: number;
  is_available: boolean;
}

export default function VolunteerDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Real DB state
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Dashboard data (still from mock for demo)
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);

  // Toast message for disabled button clicks
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derived status flags
  const approvalStatus = volunteerProfile?.approval_status || 'PENDING';
  const hasUploadedId = !!volunteerProfile?.id_document_url;
  const isApproved = approvalStatus === 'APPROVED';
  const isPending = approvalStatus === 'PENDING';
  const isRejected = approvalStatus === 'REJECTED';
  const isBanned = approvalStatus === 'BANNED';
  const canAcceptTasks = isApproved;

  // ── Fetch Volunteer Profile from Supabase ──────────────────
  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('id, name, approval_status, id_document_url, green_points, is_available')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Volunteer] Profile fetch error:', error);
        return;
      }

      setVolunteerProfile(data);
    } catch (err) {
      console.error('[Volunteer] Failed to fetch profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

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
      // Fetch real profile from Supabase
      fetchProfile(user.id);

      // Load demo data for stats/donations display
      const userStats = db.getUserStats(user.id);
      setStats(userStats);
      const allDonations = db.getActiveDonations();
      setDonations(allDonations);
    }
  }, [user, isAuthenticated, isLoading, router, fetchProfile]);

  // ── Handle Accept Delivery (with gate) ─────────────────────
  const handleAcceptDelivery = (donationId: string) => {
    if (!canAcceptTasks) {
      if (!hasUploadedId) {
        showToast('Please upload a valid Government ID before accepting tasks.');
      } else if (isPending) {
        showToast('Your account is currently under review by an Admin. You will be able to accept tasks once your ID is verified.');
      } else if (isRejected) {
        showToast('Your ID was rejected. Please re-upload a valid government-issued ID.');
      } else if (isBanned) {
        showToast('Your account has been suspended. Please contact support.');
      }
      return;
    }
    console.log('[Volunteer] Delivery accepted:', donationId);
  };

  const handleCompleteTask = (donationId: string) => {
    console.log('[Volunteer] Delivery completed:', donationId);
  };

  // ── Toast Notification ─────────────────────────────────────
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // ── KYC Upload Success Handler ─────────────────────────────
  const handleUploadComplete = (storagePath: string) => {
    // Re-fetch profile to get updated status
    if (user) {
      fetchProfile(user.id);
    }
  };

  // ── Loading State ──────────────────────────────────────────
  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Leaf className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
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

      {/* ── Toast Notification ─────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/90 shadow-lg">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200 text-sm">
              {toastMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="container py-8">

        {/* ── KYC: No ID Uploaded — Action Required ──────── */}
        {!hasUploadedId && !isApproved && (
          <div className="mb-6">
            <Alert className="mb-4 border-red-500/50 bg-red-50 dark:bg-red-950/30">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <AlertDescription className="ml-2 text-red-800 dark:text-red-200">
                <span className="font-bold text-base">⚠️ Action Required:</span>{' '}
                Please upload a valid Government ID to activate your account and start rescuing food.
                Until verified, all task actions are disabled.
              </AlertDescription>
            </Alert>
            <VolunteerKYCUpload
              volunteerId={user.id}
              volunteerName={user.name}
              currentDocumentUrl={volunteerProfile?.id_document_url}
              approvalStatus={approvalStatus}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}

        {/* ── KYC: ID Uploaded, Pending Review ──────────── */}
        {hasUploadedId && isPending && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
            <Clock className="h-5 w-5 text-amber-600" />
            <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Account Under Review —</span>{' '}
              Your identity document has been submitted and is being reviewed by an Administrator.
              You can view available deliveries below but cannot accept tasks until verified.
              This usually takes 24–48 hours.
            </AlertDescription>
          </Alert>
        )}

        {/* ── KYC: Approved ────────────────────────────── */}
        {isApproved && (
          <Alert className="mb-6 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <AlertDescription className="ml-2 text-green-800 dark:text-green-200">
              <span className="font-semibold">Identity Verified ✓</span>{' '}
              You are fully approved. Accept deliveries and start making an impact!
            </AlertDescription>
          </Alert>
        )}

        {/* ── KYC: Rejected ───────────────────────────── */}
        {isRejected && (
          <div className="mb-6">
            <Alert className="mb-4 border-red-500/50 bg-red-50 dark:bg-red-950/30" variant="destructive">
              <ShieldX className="h-5 w-5" />
              <AlertDescription className="ml-2">
                <span className="font-semibold">Verification Rejected —</span>{' '}
                Your identity document was not accepted. Please re-upload a valid
                government-issued ID below.
              </AlertDescription>
            </Alert>
            <VolunteerKYCUpload
              volunteerId={user.id}
              volunteerName={user.name}
              currentDocumentUrl={volunteerProfile?.id_document_url}
              approvalStatus={approvalStatus}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}

        {/* ── KYC: Banned ─────────────────────────────── */}
        {isBanned && (
          <Alert className="mb-6 border-red-500/50 bg-red-50 dark:bg-red-950/30" variant="destructive">
            <Ban className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <span className="font-semibold">Account Suspended —</span>{' '}
              Your account has been suspended by an administrator.
              Please contact support for more information.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Header ──────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome, {volunteerProfile?.name || user.name}!
              </h1>
              <p className="text-muted-foreground mt-2">
                {!hasUploadedId
                  ? 'Upload your ID to get started'
                  : isPending
                    ? 'Your verification is in progress — browse available pickups below'
                    : isApproved
                      ? 'Your Bounty Board is ready'
                      : 'Please resolve your account status to continue'}
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Green Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {volunteerProfile?.green_points || stats?.points || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Earned</p>
              </CardContent>
            </Card>

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

        {/* ── Main Content Grid (Read-only when not approved) ── */}
        <div className="relative">
          {/* Disabled overlay for non-approved users */}
          {!canAcceptTasks && (
            <div className="absolute -top-2 -left-2 -right-2 -bottom-2 z-10 rounded-lg pointer-events-none" />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Bounty Board — always visible, buttons gated */}
            <div className="lg:col-span-2">
              <BountyBoard
                donations={donations}
                onAccept={handleAcceptDelivery}
                disabled={!canAcceptTasks}
                disabledTooltip="Your account is currently under review by an Admin. You will be able to accept tasks once your ID is verified."
              />
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
    </div>
  );
}
