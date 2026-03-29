'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Leaf, Users, TrendingUp, Award, Activity, ShieldCheck, ShieldX,
  Clock, Weight, Store, Building2, UserCheck, AlertTriangle, CheckCircle2,
  XCircle, Eye, Loader2
} from 'lucide-react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────
interface AggregateStats {
  total_kg_donated_all_time: number;
  total_kg_delivered_today: number;
  active_volunteers_count: number;
  total_restaurants: number;
  total_ngos: number;
  total_volunteers: number;
  pending_verifications: number;
}

interface ActivityFeedItem {
  delivery_id: string;
  restaurant_name: string | null;
  ngo_name: string | null;
  volunteer_name: string | null;
  food_type: string | null;
  quantity_kg: number;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

interface PendingVolunteer {
  id: string;
  name: string | null;
  phone: string | null;
  is_available: boolean;
  green_points: number;
  approval_status: string;
  id_document_url: string | null;
  created_at: string | null;
}

// ── API Base URL ─────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [pendingVolunteers, setPendingVolunteers] = useState<PendingVolunteer[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [user, isAuthenticated, isLoading, router]);

  const loadDashboardData = async () => {
    // In production, these would use actual auth tokens:
    // const token = session?.token;
    // headers: { Authorization: `Bearer ${token}` }

    // For now, load with demo data fallback
    try {
      // Attempt to fetch from backend
      const [statsRes, feedRes, pendingRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/v1/admin/stats`, {
          headers: { 'Authorization': 'Bearer demo-token' },
        }),
        fetch(`${API_BASE}/api/v1/admin/activity-feed?limit=15`, {
          headers: { 'Authorization': 'Bearer demo-token' },
        }),
        fetch(`${API_BASE}/api/v1/admin/pending-volunteers`, {
          headers: { 'Authorization': 'Bearer demo-token' },
        }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      }
      if (feedRes.status === 'fulfilled' && feedRes.value.ok) {
        const feedData = await feedRes.value.json();
        setActivityFeed(feedData.items || []);
      }
      if (pendingRes.status === 'fulfilled' && pendingRes.value.ok) {
        const pendingData = await pendingRes.value.json();
        setPendingVolunteers(pendingData.volunteers || []);
      }
    } catch {
      // Backend not available — load demo data
      console.info('[Admin] Backend not reachable, using demo data');
    }

    // Fallback demo data if nothing was fetched
    if (!stats) {
      setStats({
        total_kg_donated_all_time: 2847.5,
        total_kg_delivered_today: 156.2,
        active_volunteers_count: 12,
        total_restaurants: 34,
        total_ngos: 8,
        total_volunteers: 28,
        pending_verifications: 3,
      });
    }

    if (activityFeed.length === 0) {
      setActivityFeed([
        {
          delivery_id: 'del-001',
          restaurant_name: "Haldiram's Nagpur",
          ngo_name: 'Nagpur Seva Sadan',
          volunteer_name: 'Aarav Deshmukh',
          food_type: 'human_veg',
          quantity_kg: 12.5,
          status: 'DELIVERED',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          delivery_id: 'del-002',
          restaurant_name: 'Saoji Bhojnalay',
          ngo_name: 'Annapurna Foundation Nagpur',
          volunteer_name: 'Sneha Borkar',
          food_type: 'human_nonveg',
          quantity_kg: 8.0,
          status: 'PICKED_UP',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          delivery_id: 'del-003',
          restaurant_name: 'Hotel Centre Point',
          ngo_name: 'Nagpur Seva Sadan',
          volunteer_name: 'Aarav Deshmukh',
          food_type: 'human_veg',
          quantity_kg: 20.0,
          status: 'DELIVERED',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          delivery_id: 'del-004',
          restaurant_name: 'Barbeque Nation Nagpur',
          ngo_name: 'Annapurna Foundation Nagpur',
          volunteer_name: 'Priya Meshram',
          food_type: 'human_nonveg',
          quantity_kg: 15.5,
          status: 'DELIVERED',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    }

    if (pendingVolunteers.length === 0) {
      setPendingVolunteers([
        {
          id: 'vol-pending-1',
          name: 'Rahul Wankhede',
          phone: '+91 99234 56789',
          is_available: true,
          green_points: 0,
          approval_status: 'PENDING',
          id_document_url: 'https://placehold.co/400x250/1a1a2e/e0e0e0?text=Aadhaar+Card',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'vol-pending-2',
          name: 'Meera Deshmukh',
          phone: '+91 88765 43210',
          is_available: false,
          green_points: 0,
          approval_status: 'PENDING',
          id_document_url: 'https://placehold.co/400x250/1a1a2e/e0e0e0?text=PAN+Card',
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'vol-pending-3',
          name: 'Vikram Thakre',
          phone: '+91 70218 99012',
          is_available: true,
          green_points: 0,
          approval_status: 'PENDING',
          id_document_url: 'https://placehold.co/400x250/1a1a2e/e0e0e0?text=Driving+License',
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    }

    setDataLoaded(true);
  };

  const handleApproval = async (volunteerId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setLoadingStates(prev => ({ ...prev, [volunteerId]: true }));

    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/volunteers/${volunteerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        console.warn('[Admin] Backend not available, updating locally');
      }
    } catch {
      console.info('[Admin] Operating in demo mode');
    }

    // Update local state regardless (demo-friendly)
    setPendingVolunteers(prev => prev.filter(v => v.id !== volunteerId));

    if (stats) {
      setStats({
        ...stats,
        pending_verifications: Math.max(0, stats.pending_verifications - 1),
        ...(newStatus === 'APPROVED' ? { active_volunteers_count: stats.active_volunteers_count + 1 } : {}),
      });
    }

    setLoadingStates(prev => ({ ...prev, [volunteerId]: false }));
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      'DELIVERED': { variant: 'default', label: 'Delivered' },
      'PICKED_UP': { variant: 'secondary', label: 'In Transit' },
      'ASSIGNED': { variant: 'outline', label: 'Assigned' },
      'PENDING': { variant: 'outline', label: 'Pending' },
    };
    const config = statusMap[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Leaf className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
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
              <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">Platform management and oversight — The Hunger Signal</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          {/* ── Stats Grid ──────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5 text-primary" />
                  Total Donated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_kg_donated_all_time?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">kg all time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.total_kg_delivered_today?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">kg delivered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                  Active Vols
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.active_volunteers_count || 0}</div>
                <p className="text-xs text-muted-foreground">online now</p>
              </CardContent>
            </Card>

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
                <p className="text-xs text-muted-foreground">total</p>
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
          </div>
        </div>

        {/* ── Pending Verifications Section ──────────────── */}
        {pendingVolunteers.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-500" />
                  Pending Verifications
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
                        {/* Volunteer Info */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm">{volunteer.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{volunteer.phone}</p>
                          </div>
                          <Badge variant="outline" className="text-amber-600 border-amber-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(volunteer.created_at)}
                          </Badge>
                        </div>

                        {/* ID Document Preview */}
                        {volunteer.id_document_url ? (
                          <div className="mb-3 rounded-lg overflow-hidden border bg-muted">
                            <img
                              src={volunteer.id_document_url}
                              alt={`ID document for ${volunteer.name}`}
                              className="w-full h-36 object-cover"
                            />
                            <div className="p-2 text-center">
                              <a
                                href={volunteer.id_document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View Full Document
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3 rounded-lg border border-dashed bg-muted flex items-center justify-center h-36">
                            <p className="text-xs text-muted-foreground">No document uploaded</p>
                          </div>
                        )}

                        {/* Action Buttons */}
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
                            onClick={() => handleApproval(volunteer.id, 'REJECTED')}
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

        {/* ── Activity Feed ─────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Activity Feed
            </CardTitle>
            <CardDescription>
              Recent delivery activity across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {activityFeed.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No delivery activity yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activityFeed.map(item => (
                      <TableRow key={item.delivery_id}>
                        <TableCell className="font-medium text-sm">
                          {item.restaurant_name || '—'}
                        </TableCell>
                        <TableCell className="text-sm">{item.ngo_name || '—'}</TableCell>
                        <TableCell className="text-sm">{item.volunteer_name || '—'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {item.food_type === 'human_veg' ? '🥬 Veg' :
                              item.food_type === 'human_nonveg' ? '🍗 Non-Veg' :
                                item.food_type || '—'}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
