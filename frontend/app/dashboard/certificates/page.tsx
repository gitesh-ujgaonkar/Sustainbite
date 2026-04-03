'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Navigation } from '@/components/navigation';
import { CertificateTemplate } from '@/components/certificate-template';
import { downloadCertificate } from '@/lib/download-certificate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Award, ShieldAlert, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  certificate_number: string;
  milestone_kg: number;
  issued_at: string;
}

const ALL_MILESTONES = [50, 100, 250, 500, 1000];

export default function CertificatesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchCertificates();
    }
  }, [user, isAuthenticated, authLoading]);

  const fetchCertificates = async () => {
    if (!user) return;
    setLoading(true);

    const matchColumn = user.role === 'donor' 
      ? 'restaurant_id' 
      : 'user_id';

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq(matchColumn, user.id)
      .order('milestone_kg', { ascending: false });

    if (!error && data) {
      setCertificates(data as Certificate[]);
      if (data.length > 0) {
        setSelectedCert(data[0] as Certificate);
      }
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!selectedCert || !user) return;
    setDownloading(true);
    
    try {
      toast("Generating 4K Validated PDF...");
      // Explicit DOM mount wait
      setTimeout(async () => {
        const success = await downloadCertificate(
          'certificate-node', 
          `${selectedCert.certificate_number.replace(/-/g, '_')}_${user.name.replace(/\s+/g, '_')}.pdf`
        );
        if (success) toast.success("PDF Downloaded securely.");
        else toast.error("Generation failed.");
        setDownloading(false);
      }, 500);
    } catch {
      setDownloading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Calculate arrays for UI
  const earnedMilestones = certificates.map(c => c.milestone_kg);
  const lockedMilestones = ALL_MILESTONES.filter(m => !earnedMilestones.includes(m)).sort((a,b) => a-b);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-bold flex items-center gap-3">
            <Award className="h-10 w-10 text-emerald-600" />
            My Certificates
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            View, track, and securely download your officially validated food rescue certificates. Hit milestones to unlock higher tier credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── LEFT: The List ──────────────────────────────── */}
          <div className="lg:col-span-4 space-y-8">
            {/* Earned */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Earned Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certificates.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic flex items-center p-4 bg-muted/50 rounded-lg">
                    <ShieldAlert className="h-4 w-4 mr-2" /> No certificates earned yet. Hit 50kg!
                  </div>
                ) : (
                  certificates.map((cert) => (
                    <button
                      key={cert.id}
                      onClick={() => setSelectedCert(cert)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                        selectedCert?.id === cert.id 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm'
                          : 'border-transparent bg-background hover:border-emerald-200'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-lg">{cert.milestone_kg}kg Tier</span>
                        <div className="text-xs font-mono text-muted-foreground mt-1 opacity-70">
                          {cert.certificate_number}
                        </div>
                      </div>
                      <Award className={`h-5 w-5 ${selectedCert?.id === cert.id ? 'text-emerald-500' : 'text-gray-400'}`} />
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Future */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  Future Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lockedMilestones.map((mk) => (
                  <div key={mk} className="w-full text-left p-3 rounded-lg border border-dashed bg-muted/30 flex justify-between items-center opacity-60 grayscale">
                    <span className="font-semibold text-muted-foreground">{mk}kg Tier</span>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {lockedMilestones.length === 0 && (
                  <div className="text-sm text-emerald-600 font-bold">You unlocked every tier!</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: The Preview ──────────────────────────── */}
          <div className="lg:col-span-8">
            <Card className="h-full flex flex-col bg-slate-100/50 dark:bg-zinc-900 border-2 overflow-hidden shadow-inner">
              {selectedCert ? (
                <>
                  <div className="flex-1 p-2 md:p-8 flex items-center justify-center overflow-x-auto">
                    {/* Scale transform wrapper to visibly mount the strict 1123x794 node into a smaller container */}
                    <div className="origin-top lg:origin-center scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.7] xl:scale-[0.8] transition-transform flex justify-center w-full">
                      <CertificateTemplate
                        type={user!.role === 'volunteer' ? 'volunteer' : 'restaurant'}
                        name={user!.name || "Food Hero"}
                        quantity_kg={selectedCert.milestone_kg}
                        date={new Date(selectedCert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        certificate_number={selectedCert.certificate_number}
                        isPreview={true}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-background border-t p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground max-w-md">
                      <span className="font-bold text-foreground">Verified Record:</span> This certificate cryptographically proves your contribution to sustainability.
                    </div>
                    <Button 
                      onClick={handleDownload} 
                      disabled={downloading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg w-full sm:w-auto h-12 px-8 text-lg"
                    >
                      {downloading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Download className="h-5 w-5 mr-2" />}
                      Download PDF
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground/50">
                  <Award className="h-24 w-24 mb-4 opacity-50" />
                  <p className="text-xl">Your certificates will populate here.</p>
                </div>
              )}
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
