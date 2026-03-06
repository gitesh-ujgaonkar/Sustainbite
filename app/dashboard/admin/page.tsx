'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { UserManagement } from '@/components/user-management';
import { TransactionLog } from '@/components/transaction-log';
import { CertificateManager } from '@/components/certificate-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db_mock';
import { Leaf, Users, TrendingUp, Award, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allDonations, setAllDonations] = useState<any[]>([]);
  const [allCertificates, setAllCertificates] = useState<any[]>([]);

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
      // Load all data
      const users = db.getAllUsers();
      setAllUsers(users);

      // Get all donations
      const allDonationsData = Object.values(db['db_mock'] || {}).flat();
      const donations = Object.keys(db).includes('getDonationById')
        ? Object.values(db['db_mock']?.mockDonations || {})
        : [];
      
      // Since we don't have direct access to all donations, reconstruct from mock
      const mockDonations = [];
      for (let i = 1; i <= 4; i++) {
        const donation = (db as any)[`getDonationById`]?.(`donation${i}`);
        if (donation) mockDonations.push(donation);
      }
      setAllDonations(mockDonations);

      // Get all certificates
      const allCertsData = Object.keys(db).includes('getCertificateById')
        ? Object.values((db as any)['mockCertificates'] || {})
        : [];
      
      const mockCerts = [];
      for (let i = 1; i <= 2; i++) {
        const cert = (db as any)[`getCertificateById`]?.(`cert${i}`);
        if (cert) mockCerts.push(cert);
      }
      setAllCertificates(mockCerts);

      // Calculate stats
      const totalDonations = mockDonations.reduce((sum, d) => sum + d.quantity_kg, 0);
      const deliveredCount = mockDonations.filter(d => d.status === 'delivered').length;
      const totalUsers = users.length;

      setStats({
        totalUsers,
        totalDonations,
        deliveredCount,
        certificatesIssued: mockCerts.length,
      });
    }
  }, [user, isAuthenticated, isLoading, router]);

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
              <p className="text-muted-foreground mt-2">Platform management and oversight</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Total Users */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active users</p>
              </CardContent>
            </Card>

            {/* Total Food */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-secondary" />
                  Total Food
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{stats?.totalDonations || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">kg tracked</p>
              </CardContent>
            </Card>

            {/* Deliveries */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.deliveredCount || 0}</div>
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
                <div className="text-3xl font-bold text-orange-500">{stats?.certificatesIssued || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Issued</p>
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">98%</div>
                <p className="text-xs text-muted-foreground mt-1">Uptime</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* User Management */}
          <UserManagement users={allUsers} />

          {/* Transaction Log */}
          <TransactionLog donations={allDonations} />

          {/* Certificate Manager */}
          <CertificateManager users={allUsers} certificates={allCertificates} />
        </div>
      </div>
    </div>
  );
}
