'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, RefreshCw, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OTPDisplayProps {
  currentOTP: string;
  expiresIn: number;
}

export function OTPDisplay({ currentOTP, expiresIn }: OTPDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(expiresIn);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentOTP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Delivery OTP
        </CardTitle>
        <CardDescription>
          Share this code with the volunteer for verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Large OTP Display */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 text-center">
          <div className="font-mono text-6xl font-bold tracking-widest text-primary mb-3">
            {currentOTP}
          </div>
          <p className="text-sm text-muted-foreground">
            {timeLeft > 0 ? `Expires in ${minutes}:${seconds.toString().padStart(2, '0')}` : 'OTP Expired'}
          </p>
        </div>

        {/* Instructions */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm">
            <p className="font-semibold mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Share this OTP with the arriving volunteer</li>
              <li>They'll enter it in the app to verify delivery</li>
              <li>Delivery will be marked complete</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Code
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Regenerate OTP"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Status */}
        {timeLeft === 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              OTP has expired. Please regenerate a new one.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
