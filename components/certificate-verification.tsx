'use client';

import React, { useState } from 'react';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/lib/db_mock';
import { Certificate } from '@/lib/types';

const BADGE_COLORS = {
  bronze: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  silver: { bg: 'bg-gray-100', text: 'text-gray-900', border: 'border-gray-300' },
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-300' },
  platinum: { bg: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-300' },
};

export function CertificateVerification() {
  const [certificateId, setCertificateId] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [donor, setDonor] = useState<any>(null);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);
    setDonor(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const found = db.getCertificateByCertificateId(certificateId);

    if (found) {
      setCertificate(found);
      const donorUser = db.getUserById(found.user_id);
      setDonor(donorUser);
      setIsOpen(true);
    } else {
      setError('Certificate not found. Please check the ID and try again.');
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section id="verify" className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Verify Achievements</h2>
          <p className="text-muted-foreground">
            Search for any SustainBite certificate ID to verify the contributor's impact and achievements.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter Certificate ID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
                    value={certificateId}
                    onChange={(e) => {
                      setCertificateId(e.target.value);
                      setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    className="pl-12 py-6 text-base"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 py-6 text-base"
                >
                  {loading ? 'Searching...' : 'Verify Certificate'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Example certificates */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-3">Try these example certificates:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => {
                  setCertificateId('550e8400-e29b-41d4-a716-446655440000');
                  setError('');
                }}
                className="px-3 py-1 rounded bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors text-xs font-mono"
              >
                550e8400-e29b...
              </button>
              <button
                onClick={() => {
                  setCertificateId('550e8400-e29b-41d4-a716-446655440001');
                  setError('');
                }}
                className="px-3 py-1 rounded bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors text-xs font-mono"
              >
                550e8400-e29b...
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Result Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Certificate Verified
            </DialogTitle>
            <DialogDescription>
              This certificate is authentic and issued by SustainBite.
            </DialogDescription>
          </DialogHeader>

          {certificate && donor && (
            <div className="space-y-6">
              {/* Badge */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full border-2 ${BADGE_COLORS[certificate.badge_color].bg} ${BADGE_COLORS[certificate.badge_color].border}`}>
                  <span className={`text-2xl font-bold ${BADGE_COLORS[certificate.badge_color].text}`}>
                    {certificate.badge_color[0].toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="space-y-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Issued To</p>
                  <p className="text-lg font-semibold">{donor.name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Milestone</p>
                  <p className="text-lg font-bold text-primary">{certificate.milestone_name}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Contribution</p>
                  <p className="text-3xl font-bold text-secondary">{certificate.total_kg_donated} kg</p>
                  <p className="text-xs text-muted-foreground mt-2">of food donated</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Issued Date</p>
                  <p className="text-sm font-mono">{new Date(certificate.issued_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Certificate ID */}
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Certificate ID</p>
                <p className="text-xs font-mono break-all">{certificate.certificate_id}</p>
              </div>

              <Button onClick={() => setIsOpen(false)} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
