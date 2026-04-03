'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Navigation } from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShieldAlert, ShieldCheck, Loader2, Calendar, User, Trophy } from 'lucide-react';
import { format } from 'date-fns';

export default function VerificationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorDesc, setErrorDesc] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setErrorDesc(null);
    setResult(null);

    const query = searchTerm.trim().toUpperCase();

    // The public RLS policy safely allows anonymous global GET checks
    const { data, error } = await supabase
      .from('certificates')
      .select('*, restaurants(name), volunteers(name)')
      .eq('certificate_number', query)
      .maybeSingle();

    if (error || !data) {
      setErrorDesc("Certificate not found or invalid. Please check the ID code again.");
    } else {
      setResult(data);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20 max-w-2xl flex flex-col items-center">
        <ShieldCheck className="h-16 w-16 text-emerald-600 mb-6" />
        <h1 className="text-4xl font-serif font-bold text-center mb-3">Official Verification Ledger</h1>
        <p className="text-muted-foreground text-center mb-10 max-w-md">
          SustainBite cryptographic certificates are minted natively via milestone tracking. Enter the official ID to physically verify the exact details of any certificate.
        </p>

        <form onSubmit={handleSearch} className="w-full flex gap-2 mb-12">
          <Input 
            autoFocus
            className="flex-1 h-12 text-lg font-mono uppercase bg-background shadow-sm border-2 focus-visible:border-emerald-500"
            placeholder="e.g. HS-VOL-1E9B3D8A"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={loading} className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </Button>
        </form>

        {errorDesc && (
          <div className="w-full bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-8 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
            <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-1">Unverified</h3>
            <p className="text-red-700 dark:text-red-300">{errorDesc}</p>
          </div>
        )}

        {result && (
          <Card className="w-full border-2 border-emerald-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-100 dark:border-emerald-900 p-6 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <ShieldCheck className="h-32 w-32" />
              </div>
              <ShieldCheck className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-3 relative z-10" />
              <h2 className="text-2xl font-bold text-emerald-950 dark:text-emerald-100 relative z-10">Valid & Verified</h2>
              <p className="text-emerald-700 dark:text-emerald-400 font-mono mt-1 relative z-10">ID: {result.certificate_number}</p>
            </div>
            <CardContent className="p-8 space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-full shrink-0">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Issued Officially To</p>
                  <p className="text-xl font-bold font-serif mt-1">
                    {result.volunteers?.name || result.restaurants?.name || "Unknown Identity"}
                  </p>
                  <p className="text-sm text-muted-foreground">{result.user_id ? 'Registered Volunteer' : 'Registered Restaurant Partner'}</p>
                </div>
              </div>

              <div className="w-full border-t border-dashed my-4" />

              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-full shrink-0">
                  <Trophy className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recognized Achievement</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">
                    {result.milestone_kg} Kilograms of Food Saved
                  </p>
                </div>
              </div>

              <div className="w-full border-t border-dashed my-4" />

              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-full shrink-0">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Date Granted</p>
                  <p className="text-lg font-medium mt-1">
                    {format(new Date(result.issued_at), 'MMMM do, yyyy - HH:mm')}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
