'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Leaf, Users, TrendingUp, Activity, ShieldCheck,
  Clock, Weight, Store, Building2, UserCheck, AlertTriangle, CheckCircle2,
  XCircle, Eye, Loader2, RefreshCw, Inbox,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────
interface AggregateStats {
  total_restaurants: number;
  total_ngos: number;
  total_volunteers: number;
  approved_volunteers: number;
  pending_verifications: number;
  total_deliveries: number;
  delivered_count: number;
  in_progress_count: number;
}

interface DeliveryRow {
  id: string;
  food_type: string | null;
  quantity_kg: number;
  status: string;
  created_at: string;
  updated_at: string | null;
  restaurants: { name: string } | null;
  ngos: { name: string } | null;
  volunteers: { name: string } | null;
}

interface PendingVolunteer {
  id: string;
  name: string | null;
  phone: string | null;
  is_available: boolean;
  green_points: number;
  approval_status: string;
  id_document_url: string | null;
  kyc_remarks?: string | null;
  created_at: string | null;
}

// ── API Base URL ─────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminDashboardPage() {
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<DeliveryRow[]>([]);
  const [pendingVolunteers, setPendingVolunteers] = useState<PendingVolunteer[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  // ── Load Real Data from Supabase ───────────────────────────
  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);

    try {
      // 1. Count restaurants
      const { count: restCount } = await supabase
        .from('restaurants')
        .select('id', { count: 'exact', head: true });

      // 2. Count NGOs
      const { count: ngoCount } = await supabase
        .from('ngos')
        .select('id', { count: 'exact', head: true });

      // 3. Count all volunteers
      const { count: volCount } = await supabase
        .from('volunteers')
        .select('id', { count: 'exact', head: true });

      // 4. Count approved volunteers
      const { count: approvedCount } = await supabase
        .from('volunteers')
        .select('id', { count: 'exact', head: true })
        .eq('approval_status', 'APPROVED');

      // 5. Count pending verifications
      const { count: pendingCount } = await supabase
        .from('volunteers')
        .select('id', { count: 'exact', head: true })
        .eq('approval_status', 'PENDING');

      // 6. Count all deliveries
      const { count: totalDel } = await supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true });

      // 7. Count delivered
      const { count: deliveredCount } = await supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'DELIVERED');

      // 8. Count in-progress (ASSIGNED + PICKED)
      const { count: inProgressCount } = await supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .in('status', ['ASSIGNED', 'PICKED']);

      setStats({
        total_restaurants: restCount || 0,
        total_ngos: ngoCount || 0,
        total_volunteers: volCount || 0,
        approved_volunteers: approvedCount || 0,
        pending_verifications: pendingCount || 0,
        total_deliveries: totalDel || 0,
        delivered_count: deliveredCount || 0,
        in_progress_count: inProgressCount || 0,
      });

      // 9. Recent deliveries (activity feed)
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const delivRes = await fetch(`${API_BASE}/api/v1/deliveries`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      let deliveries = [];
      if (delivRes.ok) {
        const delivData = await delivRes.json();
        deliveries = delivData.deliveries || [];
      } else {
        console.error('[Admin] Failed to fetch deliveries via API');
      }

      setRecentDeliveries(deliveries);

      // 10. Pending volunteers
      const { data: pending } = await supabase
        .from('volunteers')
        .select('id, name, phone, is_available, green_points, approval_status, id_document_url, created_at')
        .eq('approval_status', 'PENDING')
        .order('created_at', { ascending: true });

      setPendingVolunteers(pending || []);

    } catch (err) {
      console.error('[Admin] Dashboard data fetch error:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    if (user) {
      loadDashboardData();
    }
  }, [user, isAuthenticated, authLoading, router, loadDashboardData]);

  // ── Fetch Signed URL for Volunteer ID Document ─────────────
  const fetchSignedUrl = async (volunteerId: string) => {
    if (signedUrls[volunteerId]) return; // Already fetched

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/volunteer-id-url/${volunteerId}`,
        {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSignedUrls(prev => ({ ...prev, [volunteerId]: data.signed_url }));
      }
    } catch (err) {
      console.warn('[Admin] Failed to fetch signed URL:', err);
    }
  };

  // ── Approve/Reject Volunteer ───────────────────────────────
  const handleApproval = async (volunteerId: string, newStatus: 'APPROVED' | 'REJECTED', reason?: string) => {
    setLoadingStates(prev => ({ ...prev, [volunteerId]: true }));

    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/volunteers/${volunteerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ status: newStatus, reason }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('[Admin] Approval failed:', errData.detail);
      }

      // Refresh data from DB to get real state
      await loadDashboardData();
    } catch (err) {
      console.error('[Admin] Approval request failed:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, [volunteerId]: false }));
    }
  };

  // ── Helpers ────────────────────────────────────────────────
  const formatTime = (isoString: string | null) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      'DELIVERED': { variant: 'default', label: '✅ Delivered' },
      'PICKED': { variant: 'secondary', label: '🚚 In Transit' },
      'ASSIGNED': { variant: 'outline', label: '📋 Assigned' },
      'AVAILABLE': { variant: 'outline', label: '🟢 Available' },
    };
    const config = statusMap[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // ── Loading State ──────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Leaf className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Platform management — The Hunger Signal (Live Data)
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={dataLoading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${dataLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>

          {/* ── Stats Grid (All from real DB) ──────────────── */}
          {dataLoading && !stats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading statistics...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 text-orange-500" />
                    Restaurants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_restaurants || 0}</div>
                  <p className="text-xs text-muted-foreground">registered</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-purple-600" />
                    NGOs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_ngos || 0}</div>
                  <p className="text-xs text-muted-foreground">partners</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-secondary" />
                    Volunteers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_volunteers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.approved_volunteers || 0} approved
                  </p>
                </CardContent>
              </Card>

              <Card className={stats?.pending_verifications ? 'border-amber-500/50' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    Pending KYC
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">{stats?.pending_verifications || 0}</div>
                  <p className="text-xs text-muted-foreground">to review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    Total Deliveries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_deliveries || 0}</div>
                  <p className="text-xs text-muted-foreground">all time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.delivered_count || 0}</div>
                  <p className="text-xs text-muted-foreground">delivered</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats?.in_progress_count || 0}</div>
                  <p className="text-xs text-muted-foreground">active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    Approved Vols
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats?.approved_volunteers || 0}</div>
                  <p className="text-xs text-muted-foreground">verified</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* ── Pending Verifications ────────────────────────── */}
        {pendingVolunteers.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-500" />
                  Pending Verifications ({pendingVolunteers.length})
                </CardTitle>
                <CardDescription>
                  Review uploaded identity documents and approve or reject volunteer accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pendingVolunteers.map(volunteer => (
                    <Card key={volunteer.id} className="border-dashed border-amber-300 dark:border-amber-700">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm">{volunteer.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{volunteer.phone || 'No phone'}</p>
                          </div>
                          <Badge variant="outline" className="text-amber-600 border-amber-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(volunteer.created_at)}
                          </Badge>
                        </div>

                        {/* ID Document */}
                        {volunteer.id_document_url ? (
                          <div className="mb-3 rounded-lg border bg-muted p-3 text-center">
                            {signedUrls[volunteer.id] ? (
                              <div>
                                <img
                                  src={signedUrls[volunteer.id]}
                                  alt={`ID for ${volunteer.name}`}
                                  className="w-full h-36 object-cover rounded mb-2"
                                />
                                <a
                                  href={signedUrls[volunteer.id]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" /> View Full Document
                                </a>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchSignedUrl(volunteer.id)}
                                className="text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" /> Load ID Document
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="mb-3 rounded-lg border border-dashed bg-muted flex items-center justify-center h-20">
                            <p className="text-xs text-muted-foreground">No document uploaded yet</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApproval(volunteer.id, 'APPROVED')}
                            disabled={loadingStates[volunteer.id]}
                          >
                            {loadingStates[volunteer.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              const reason = window.prompt("Enter reason for rejection (this will be shown to the volunteer):");
                              if (reason !== null) {
                                if (reason.trim() === "") {
                                  alert("A rejection reason is required.");
                                  return;
                                }
                                handleApproval(volunteer.id, 'REJECTED', reason);
                              }
                            }}
                            disabled={loadingStates[volunteer.id]}
                          >
                            {loadingStates[volunteer.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <><XCircle className="h-4 w-4 mr-1" /> Reject</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Activity Feed (Real Deliveries) ─────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Delivery Activity ({recentDeliveries.length})
            </CardTitle>
            <CardDescription>
              Real delivery activity from the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading activity...</span>
              </div>
            ) : recentDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-semibold">No Delivery Activity Yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Deliveries will appear here once restaurants start donating food.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>NGO</TableHead>
                      <TableHead>Volunteer</TableHead>
                      <TableHead className="text-center">Type</TableHead>
                      <TableHead className="text-right">Qty (kg)</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDeliveries.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">
                          {item.restaurants?.name || '—'}
                        </TableCell>
                        <TableCell className="text-sm">{item.ngos?.name || '—'}</TableCell>
                        <TableCell className="text-sm">{item.volunteers?.name || '—'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {item.food_type?.replace('_', ' ') || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">
                          {item.quantity_kg}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatTime(item.updated_at || item.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
