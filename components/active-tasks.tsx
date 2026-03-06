'use client';

import React, { useState } from 'react';
import { Donation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, Camera, CheckCircle2, PawPrint, Clock, AlertCircle } from 'lucide-react';

interface ActiveTasksProps {
  donations: Donation[];
  onComplete: (donationId: string) => void;
}

export function ActiveTasks({ donations, onComplete }: ActiveTasksProps) {
  const [selectedTask, setSelectedTask] = useState<Donation | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<'otp' | 'photo'>('otp');
  const [otpInput, setOtpInput] = useState('');
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completed, setCompleted] = useState(false);

  const activeTasks = donations.filter(d => d.status === 'assigned' || d.status === 'picked');

  if (activeTasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 text-center">
          <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="font-semibold">No Active Tasks</p>
          <p className="text-sm text-muted-foreground">Accept a pickup from the bounty board to get started</p>
        </CardContent>
      </Card>
    );
  }

  const handleCompleteClick = (donation: Donation) => {
    setSelectedTask(donation);
    
    // Auto-select verification method based on food type
    if (donation.food_type === 'animal_safe') {
      setVerificationMethod('photo');
    } else {
      setVerificationMethod('otp');
    }
    
    setShowCompleteDialog(true);
  };

  const handleCompleteTask = async () => {
    if (verificationMethod === 'otp' && otpInput !== '7842') {
      alert('Incorrect OTP. Please try again.');
      return;
    }

    // Simulate completion
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (selectedTask) {
      onComplete(selectedTask.id);
      setCompleted(true);
      
      setTimeout(() => {
        setShowCompleteDialog(false);
        setCompleted(false);
        setOtpInput('');
        setSelectedTask(null);
      }, 2000);
    }
  };

  return (
    <>
      <Card className="border-2 border-secondary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary" />
            Active Tasks ({activeTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTasks.map((donation) => (
              <div key={donation.id} className="border border-border rounded-lg p-4 space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{donation.food_name}</h3>
                    {donation.food_type === 'animal_safe' && (
                      <PawPrint className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <Badge className={donation.status === 'picked' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
                    {donation.status === 'picked' ? '📦 Picked Up' : '🚗 Assigned'}
                  </Badge>
                </div>

                {/* Addresses */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">PICKUP</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p>{donation.pickup_address}</p>
                    </div>
                  </div>

                  {donation.delivery_address && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1 pt-2">DELIVERY</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                        <p>{donation.delivery_address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {donation.status === 'assigned' && (
                    <Button size="sm" variant="outline" className="flex-1">
                      Mark as Picked Up
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleCompleteClick(donation)}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {donation.status === 'picked' ? 'Verify & Complete' : 'Start Navigation'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completion Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Delivery Completion</DialogTitle>
            <DialogDescription>
              {selectedTask?.food_type === 'animal_safe'
                ? 'Verify by uploading a photo of the food being distributed to animals'
                : 'Enter the recipient OTP to confirm delivery'}
            </DialogDescription>
          </DialogHeader>

          {completed && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto animate-bounce" />
              <div>
                <p className="font-semibold">Delivery Complete!</p>
                <p className="text-sm text-muted-foreground">You've earned 50 Green Points</p>
              </div>
            </div>
          )}

          {!completed && selectedTask && (
            <div className="space-y-4">
              {selectedTask.food_type === 'animal_safe' ? (
                <>
                  <Alert className="bg-orange-50 border-orange-200">
                    <Camera className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-900">
                      Take a clear photo showing the food being distributed to animals or strays
                    </AlertDescription>
                  </Alert>

                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Click to take photo</p>
                    <p className="text-xs text-muted-foreground">or tap and hold for gallery</p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter Recipient OTP</Label>
                  <Input
                    id="otp"
                    placeholder="0000"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.slice(0, 4))}
                    maxLength={4}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    The OTP was shown to the recipient
                  </p>
                </div>
              )}

              <Button
                onClick={handleCompleteTask}
                className="w-full bg-primary hover:bg-primary/90 py-6"
              >
                {selectedTask.food_type === 'animal_safe' ? 'Upload Photo & Complete' : 'Verify OTP & Complete'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
