'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Navigation } from '@/components/navigation';
import { VolunteerKYCUpload } from '@/components/volunteer-kyc-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Leaf, Zap, Trophy, TrendingUp, ShieldAlert, ShieldCheck,
  ShieldX, Ban, Clock, MapPin, Package, CheckCircle2,
  Loader2, Bell, KeyRound, Award
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger, AlertDialogFooter
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRealtimeDeliveries } from '@/hooks/useRealtimeDeliveries';
import { toast } from 'sonner';
import { DeliveryDetailsModal } from '@/components/delivery-details-modal';
import { downloadCertificate } from '@/lib/download-certificate';
import { CertificateTemplate } from '@/components/certificate-template';
import { MyCertificates } from '@/components/my-certificates';

// ── Types ────────────────────────────────────────────────────
interface VolunteerProfile {
  id: string;
  name: string;
  approval_status: string;
  id_document_url: string | null;
  green_points: number;
  is_available: boolean;
  kyc_remarks?: string | null;
}

interface Delivery {
  id: string;
  dish_name: string;
  food_category: string;
  quantity_kg: number;
  status: string;
  is_expiring_soon?: boolean;
  restaurant_remark?: string | null;
  cooked_time?: string;
  created_at: string;
  updated_at: string | null;
  volunteer_id: string | null;
  restaurant_id: string | null;
  ngo_id: string | null;
  restaurants?: { name: string } | null;
  ngos?: { name: string } | null;
}

export default function VolunteerDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Real Supabase data
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile | null>(null);
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [myActiveTasks, setMyActiveTasks] = useState<Delivery[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Loading states
  const [profileLoading, setProfileLoading] = useState(true);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // OTP Verification Modal State
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Derived status
  const approvalStatus = volunteerProfile?.approval_status || 'PENDING';
  const hasUploadedId = !!volunteerProfile?.id_document_url;
  const isApproved = approvalStatus === 'APPROVED';
  const isPending = approvalStatus === 'PENDING';
  const isRejected = approvalStatus === 'REJECTED';
  const isBanned = approvalStatus === 'BANNED';
  const canAcceptTasks = isApproved;

  // ── Fetch Volunteer Profile ────────────────────────────────
  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('id, name, approval_status, id_document_url, green_points, is_available, kyc_remarks')
        .eq('id', userId)
        .single();

      if (!error && data) setVolunteerProfile(data);
    } catch (err) {
      console.error('[Volunteer] Profile fetch error:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // ── Fetch Gamification Stats ───────────────────────────────
  const fetchStats = useCallback(async (userId: string) => {
    setStatsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      const res = await fetch(`${API_BASE}/api/v1/stats/volunteers/me`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalDonated: data.total_kg,
          deliveredCount: data.total_deliveries,
          points: data.total_points
        });
      }
    } catch (err) {
      console.error('[Volunteer] Stats fetch error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch Real Deliveries from Supabase ────────────────────
  const fetchDeliveries = useCallback(async (userId: string) => {
    setDeliveriesLoading(true);
    try {
      // Fetch available deliveries (not yet claimed) via Backend API
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const availRes = await fetch(`${API_BASE}/api/v1/deliveries/available`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      let available = [];
      if (availRes.ok) {
        const availData = await availRes.json();
        available = availData.deliveries || [];

        // Prioritize expiring items to always float to the top
        available.sort((a: any, b: any) => {
          if (a.is_expiring_soon && !b.is_expiring_soon) return -1;
          if (!a.is_expiring_soon && b.is_expiring_soon) return 1;
          return 0;
        });
      } else {
        console.error('[Volunteer] Failed to fetch available deliveries via API');
      }

      setAvailableDeliveries(available);

      // Fetch my active tasks (assigned to me, not delivered)
      const { data: active } = await supabase
        .from('deliveries')
        .select('id, dish_name, food_category, quantity_kg, status, cooked_time, created_at, updated_at, restaurant_id, ngo_id, restaurant_remark, pickup_address, restaurants(name, phone), ngos(name, phone)')
        .eq('volunteer_id', userId)
        .in('status', ['ASSIGNED', 'PICKED'])
        .order('created_at', { ascending: false });

      setMyActiveTasks((active as any) || []);

      // Count completed deliveries
      const { count } = await supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .eq('volunteer_id', userId)
        .eq('status', 'DELIVERED');

      setCompletedCount(count || 0);
    } catch (err) {
      console.error('[Volunteer] Deliveries fetch error:', err);
    } finally {
      setDeliveriesLoading(false);
    }
  }, []);

  // ── Initialize ─────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'volunteer') {
      router.push('/');
      return;
    }
    if (user) {
      fetchProfile(user.id);
      fetchDeliveries(user.id);
      fetchStats(user.id);
    }
  }, [user, isAuthenticated, authLoading, router, fetchProfile, fetchDeliveries, fetchStats]);

  // ── Supabase Realtime Hook ──────────────────────────────────
  useRealtimeDeliveries({
    enabled: isAuthenticated && user?.role === 'volunteer',
    onInsert: (payload) => {
      const newDelivery = payload.new as Delivery;
      if (newDelivery.status === 'AVAILABLE') {
        // Automatically inject new active tasks into the UI
        setAvailableDeliveries((prev) => {
          // Check if already exists to prevent duplicate renders
          if (prev.some(d => d.id === newDelivery.id)) return prev;
          
          toast.success("🍲 New donation available near you!", {
            description: `${newDelivery.quantity_kg}kg of ${newDelivery.dish_name || 'food'} was just posted.`,
            duration: 6000,
          });
          
          return [newDelivery, ...prev];
        });
      }
    },
    onUpdate: (payload) => {
      const updatedDelivery = payload.new as Delivery;
      
      // If a task is no longer AVAILABLE (e.g. claimed by someone else), remove it from the public pool
      if (updatedDelivery.status !== 'AVAILABLE') {
        setAvailableDeliveries((prev) => prev.filter(d => d.id !== updatedDelivery.id));
      }
      
      // If a task assigned specifically to ME is updated (e.g. deleted or marked as delivered), remove it
      if (updatedDelivery.volunteer_id === user?.id) {
        if (updatedDelivery.status === 'DELIVERED') {
          // It was successfully delivered! Remove from active tasks, and optimistic bump count
          setMyActiveTasks((prev) => prev.filter(d => d.id !== updatedDelivery.id));
          setCompletedCount(c => c + 1);
          
          // Re-sync Gamification engine (Points & Certificates Vault) explicitly!
          if (user) {
            fetchStats(user.id);
            fetchProfile(user.id);
          }
        } else {
          // General status update, update existing task properties
          setMyActiveTasks((prev) => prev.map(d => d.id === updatedDelivery.id ? { ...d, ...updatedDelivery } : d));
        }
      }
    },
    onDelete: (payload) => {
      const deletedId = payload.old.id;
      setAvailableDeliveries((prev) => prev.filter(d => d.id !== deletedId));
      setMyActiveTasks((prev) => prev.filter(d => d.id !== deletedId));
    }
  });

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // ── Handle Accept Delivery ─────────────────────────────────
  const handleAcceptDelivery = async (deliveryId: string) => {
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

    // Call backend to claim
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/deliveries/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ delivery_id: deliveryId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to claim delivery.');
      }

      showToast('Delivery claimed successfully! Check your Active Tasks.');
      // Refresh data
      if (user) fetchDeliveries(user.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to claim delivery.');
    }
  };

  // ── Handle Delivery Cancellation (Volunteer Dropout) ─────────
  const handleCancelDelivery = async (deliveryId: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/deliveries/${deliveryId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to cancel delivery.');
      }

      showToast("Pickup cancelled! The task was safely returned to the available pool.");
      
      // Realtime will catch this, but optimistically removing it helps UX feel snappier
      setMyActiveTasks(prev => prev.filter(d => d.id !== deliveryId));
      if (user) fetchDeliveries(user.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel delivery.');
    }
  };

  // ── Handle Delivery Status Update ──────────────────────────
  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to update status.');
      }

      showToast(`Delivery status updated to ${newStatus}.`);
      if (user) fetchDeliveries(user.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status.');
    }
  };

  // ── Dashboard Wide Certificate Context ────────────────────
  const [selectedCertContext, setSelectedCertContext] = useState<any>(null);

  // ── Handle OTP Verification ────────────────────────────────
  const handleVerifyOTP = async () => {
    if (!selectedDeliveryId || !otpCode || otpCode.length !== 6) {
      showToast("Please enter a valid 6-digit OTP code.");
      return;
    }

    setVerifying(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/deliveries/${selectedDeliveryId}/verify-pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ otp: otpCode }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to verify OTP.');
      }

      showToast("Pickup verified successfully! Task is now IN TRANSIT.");
      setVerifyModalOpen(false);
      setOtpCode('');
      setSelectedDeliveryId(null);
      if (user) fetchDeliveries(user.id);
    } catch (err: any) {
      showToast(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // ── KYC Upload Success ─────────────────────────────────────
  const handleUploadComplete = () => {
    if (user) fetchProfile(user.id);
  };

  // ── Loading ────────────────────────────────────────────────
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Leaf className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'volunteer') return null;

  // Milestone Math
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

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/90 shadow-lg">
            <Bell className="h-4 w-4 text-amber-600" />
            <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200 text-sm">
              {toastMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* OTP Verification Modal */}
      <AlertDialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Verify Food Pickup
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the 6-digit OTP code sent to the restaurant owner's email. This ensures the food has been correctly handed over to you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-2">
            <Label htmlFor="otp">Pickup OTP</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="e.g. 123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-[0.3em] font-semibold h-14"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel disabled={verifying}>Cancel</AlertDialogCancel>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleVerifyOTP}
              disabled={verifying || otpCode.length !== 6}
            >
              {verifying ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying</>
              ) : (
                'Verify & Pick Up'
              )}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container py-8">

        {/* ── KYC: No ID Uploaded ─────────────────────── */}
        {!hasUploadedId && !isApproved && (
          <div className="mb-6">
            <Alert className="mb-4 border-red-500/50 bg-red-50 dark:bg-red-950/30">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <AlertDescription className="ml-2 text-red-800 dark:text-red-200">
                <span className="font-bold text-base">⚠️ Action Required:</span>{' '}
                Please upload a valid Government ID to activate your account and start rescuing food.
              </AlertDescription>
            </Alert>
            <VolunteerKYCUpload
              volunteerId={user.id}
              volunteerName={user.name}
              currentDocumentUrl={null}
              approvalStatus={approvalStatus}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}

        {/* ── KYC: Pending Review ─────────────────────── */}
        {hasUploadedId && isPending && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
            <Clock className="h-5 w-5 text-amber-600" />
            <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Account Under Review —</span>{' '}
              Your ID has been submitted. You can browse available deliveries but cannot accept tasks until verified (24–48 hours).
            </AlertDescription>
          </Alert>
        )}

        {/* ── KYC: Approved ───────────────────────────── */}
        {isApproved && (
          <Alert className="mb-6 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <AlertDescription className="ml-2 text-green-800 dark:text-green-200">
              <span className="font-semibold">Identity Verified ✓</span>{' '}
              You are fully approved. Accept deliveries and make an impact!
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
                Please re-upload a valid government-issued ID below.
                {volunteerProfile?.kyc_remarks && (
                  <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/40 rounded-md border border-red-200 dark:border-red-800 text-sm">
                    <strong>Admin Remarks:</strong> {volunteerProfile.kyc_remarks}
                  </div>
                )}
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
              Please contact support for more information.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Header + Stats ──────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome, {volunteerProfile?.name || user.name}!
              </h1>
              <p className="text-muted-foreground mt-2">
                {isApproved
                  ? 'Your Bounty Board is ready'
                  : isRejected
                    ? 'Your ID was rejected. Please re-upload your document.'
                    : isBanned
                      ? 'Your account has been suspended.'
                      : !hasUploadedId
                        ? 'Upload your ID to get started'
                        : 'Your verification is in progress — browse available pickups below'}
              </p>
            </div>
            <div className="flex gap-2">
              {/* Generic cert button removed in favor of Vault specific certificates */}
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" /> Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-secondary" /> Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{myActiveTasks.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Tasks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Green Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : (stats?.points || volunteerProfile?.green_points || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-secondary" /> Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{availableDeliveries.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Pickups</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Gamification Milestone ─────────────────────── */}
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
                  {statsLoading ? '...' : (stats?.totalDonated || 0)} / {nextMilestone.kg} kg transported
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

        {/* ── My Certificates Vault ─────────────────────── */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            My Digital Certificates
          </h2>
          <MyCertificates 
            userId={user.id} 
            role="volunteer" 
            userName={volunteerProfile?.name || user.name || "Volunteer"} 
            setSelectedCertContext={setSelectedCertContext}
          />
        </div>

        {/* ── Main Content ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Available Deliveries (Real Data) ──────── */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Available Pickups ({availableDeliveries.length})</span>
                  <Leaf className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deliveriesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading deliveries...</span>
                  </div>
                ) : availableDeliveries.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="font-semibold text-lg">No Active Tasks Available</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      No active food rescue tasks available right now. We will notify you when a match is found.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableDeliveries.map((delivery) => (
                      <div
                        key={delivery.id}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {delivery.is_expiring_soon && (
                              <Badge variant="destructive" className="mb-2 animate-pulse bg-orange-600 hover:bg-orange-700 text-[10px] uppercase font-bold tracking-wider">
                                🔥 Might go bad soon! High Priority.
                              </Badge>
                            )}
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">
                                {delivery.dish_name || 'Food Pickup'}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {delivery.quantity_kg} kg
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {delivery.food_category}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              From: {delivery.restaurants?.name || 'Unknown Restaurant'}
                            </p>
                            {delivery.cooked_time && (
                              <p className="text-xs font-semibold text-amber-700 dark:text-amber-500 mt-2 bg-amber-50 dark:bg-amber-950/30 inline-flex px-2 py-1 rounded-sm">
                                👨‍🍳 Prepared at: {new Date(delivery.cooked_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </p>
                            )}
                            {delivery.ngos?.name && (
                              <p className="text-sm text-muted-foreground mt-1">
                                To: {delivery.ngos.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(delivery.created_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        <div className="relative group mt-3 flex items-center gap-2">
                          <DeliveryDetailsModal donation={delivery as any} trigger={
                            <Button variant="outline" className="w-[120px]">
                              Details
                            </Button>
                          } />
                          <div className="flex-1">
                            <Button
                              onClick={() => handleAcceptDelivery(delivery.id)}
                              className={`w-full ${!canAcceptTasks ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                              disabled={!canAcceptTasks}
                            >
                              {canAcceptTasks ? 'Accept Delivery' : '🔒 Accept Delivery'}
                            </Button>
                            {!canAcceptTasks && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal max-w-[280px] text-center shadow-lg z-20">
                                Your account is currently under review by an Admin. You will be able to accept tasks once your ID is verified.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── My Active Tasks (Real Data) ───────────── */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-secondary" />
                  My Active Tasks ({myActiveTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deliveriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : myActiveTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm font-medium">No Active Tasks</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Accept a delivery to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myActiveTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm truncate max-w-[200px]" title={task.dish_name}>
                            {task.dish_name || 'Delivery'}
                          </span>
                          <Badge
                            variant={task.status === 'PICKED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {task.food_category} • {task.quantity_kg} kg
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          From: {task.restaurants?.name || 'Unknown'}
                        </p>
                        {task.cooked_time && (
                          <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-500 mt-1">
                            👨‍🍳 Prepared at: {new Date(task.cooked_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </p>
                        )}
                        {task.ngos?.name && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> To: {task.ngos.name}
                          </p>
                        )}
                        <div className="mt-3 flex flex-col gap-2">
                          <DeliveryDetailsModal donation={task as any} trigger={
                            <Button variant="outline" size="sm" className="w-full">
                              View Complete Details
                            </Button>
                          } />
                          {task.status === 'ASSIGNED' && (
                            <Button
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={() => {
                                setSelectedDeliveryId(task.id);
                                setOtpCode('');
                                setVerifyModalOpen(true);
                              }}
                            >
                              <KeyRound className="h-4 w-4 mr-2" />
                              Verify Pickup
                            </Button>
                          )}
                          {task.status === 'PICKED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                              onClick={() => handleUpdateStatus(task.id, 'DELIVERED')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Delivered
                            </Button>
                          )}
                          
                          {/* Cancel Pickup (Dropping the task safely back to the pool) */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="w-full text-destructive hover:bg-destructive/10"
                              >
                                Cancel Pickup
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Forfeit this task?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you can no longer complete this delivery? There are no point penalties, but the food will be immediately exposed to the public dashboard for another volunteer to claim.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Nevermind</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleCancelDelivery(task.id)} 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Yes, Cancel
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Invisible Certificate DOM Node (Required for async jspdf rendering) */}
      {selectedCertContext && user && (
        <CertificateTemplate
          type="volunteer"
          name={volunteerProfile?.name || user.name || "Awesome Volunteer"}
          quantity_kg={selectedCertContext.milestone_kg}
          date={new Date(selectedCertContext.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          certificate_number={selectedCertContext.certificate_number}
        />
      )}

    </div>
  );
}
