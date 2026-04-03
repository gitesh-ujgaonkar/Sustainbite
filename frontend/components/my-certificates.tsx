'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Award, Download, ShieldCheck } from 'lucide-react';
import { downloadCertificate } from '@/lib/download-certificate';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  certificate_number: string;
  milestone_kg: number;
  issued_at: string;
}

interface MyCertificatesProps {
  userId: string;
  role: 'volunteer' | 'restaurant';
  userName: string;
  setSelectedCertContext: (cert: Certificate) => void;
}

export function MyCertificates({ userId, role, userName, setSelectedCertContext }: MyCertificatesProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCertificates() {
      setLoading(true);
      const column = role === 'volunteer' ? 'user_id' : 'restaurant_id';
      
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq(column, userId)
        .order('milestone_kg', { ascending: false });

      if (!error && data) {
        setCertificates(data as Certificate[]);
      }
      setLoading(false);
    }
    fetchCertificates();
  }, [userId, role]);

  const handleDownload = async (cert: Certificate) => {
    setDownloadingId(cert.id);
    setSelectedCertContext(cert); // Mounts the specific cert into the hidden template
    
    try {
      toast("Rendering High-Resolution Secure Certificate...");
      // Wrap in timeout to guarantee React re-renders the hidden template state first
      setTimeout(async () => {
        const success = await downloadCertificate(
          'certificate-node', 
          `${cert.certificate_number.replace(/-/g, '_')}_${userName.replace(/\s+/g, '_')}.pdf`
        );
        if (success) toast.success("PDF Downloaded successfully!");
        else toast.error("PDF engine failed.");
        setDownloadingId(null);
      }, 500);
    } catch {
      setDownloadingId(null);
    }
  };

  const getBadgeStyle = (kg: number) => {
    if (kg >= 1000) return "bg-slate-900 border-slate-700 text-slate-100";
    if (kg >= 500) return "bg-purple-50 border-purple-200 text-purple-700";
    if (kg >= 250) return "bg-yellow-50 border-yellow-200 text-yellow-700";
    if (kg >= 100) return "bg-slate-100 border-slate-300 text-slate-700";
    return "bg-emerald-50 border-emerald-200 text-emerald-700";
  };

  const getTierName = (kg: number) => {
    if (kg >= 1000) return "Obsidian Master";
    if (kg >= 500) return "Platinum Legend";
    if (kg >= 250) return "Gold Hero";
    if (kg >= 100) return "Silver Champion";
    return "Bronze Contributor";
  };

  if (loading) {
    return <div className="flex animate-pulse items-center gap-2 text-muted-foreground p-8"><Loader2 className="animate-spin h-5 w-5" /> Loading Digital Vault...</div>;
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50 border-dashed">
        <Award className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <h3 className="font-semibold text-lg text-foreground">No Milestones Yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
          Complete deliveries to save surplus food. The moment you hit 50kg, your first verified certificate will automatically mint!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((cert) => (
        <Card key={cert.id} className={`overflow-hidden border-2 transition-all hover:shadow-md ${getBadgeStyle(cert.milestone_kg)}`}>
          <div className="h-2 w-full bg-current opacity-20" />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  {getTierName(cert.milestone_kg)}
                </CardTitle>
                <CardDescription className="font-medium opacity-80 mt-1">
                  {cert.milestone_kg}kg Food Saved
                </CardDescription>
              </div>
              <ShieldCheck className="h-6 w-6 opacity-60" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-xs font-mono bg-background/50 py-1.5 px-3 rounded-md mb-4 flex justify-between items-center opacity-80 border border-current/10">
              <span>{cert.certificate_number}</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full bg-background/50 hover:bg-background border-current/20 hover:text-foreground"
              disabled={downloadingId === cert.id}
              onClick={() => handleDownload(cert)}
            >
              {downloadingId === cert.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Print official PDF
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
