'use client';

import React, { useState } from 'react';
import { Donation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Leaf, PawPrint, AlertCircle, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BountyBoardProps {
  donations: Donation[];
  onAccept: (donationId: string) => void;
}

export function BountyBoard({ donations, onAccept }: BountyBoardProps) {
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null);

  const availableDonations = donations.filter(d => d.status === 'available');

  if (availableDonations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 text-center">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="font-semibold">No Available Pickups</p>
          <p className="text-sm text-muted-foreground">Check back soon for new donations!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Available Pickups ({availableDonations.length})</span>
          <Leaf className="h-5 w-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {availableDonations.map((donation) => {
            const timeLeft = new Date(donation.expiry_time).getTime() - Date.now();
            const isUrgent = timeLeft < 30 * 60 * 1000; // Less than 30 minutes

            return (
              <div
                key={donation.id}
                className={`border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer ${
                  selectedDonation === donation.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setSelectedDonation(selectedDonation === donation.id ? null : donation.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{donation.food_name}</h3>
                      {donation.food_type === 'animal_safe' ? (
                        <PawPrint className="h-5 w-5 text-orange-500" title="Stray Animal Feed" />
                      ) : (
                        <Leaf className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-secondary">{donation.quantity_kg} kg</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 justify-end">
                    {donation.food_type === 'animal_safe' && (
                      <Badge variant="outline" className="bg-orange-50">
                        🐾 Stray Feed
                      </Badge>
                    )}
                    {donation.food_type === 'human_nonveg' && (
                      <Badge variant="outline" className="bg-orange-50">
                        🍗 Non-Veg
                      </Badge>
                    )}
                    {donation.is_spicy && (
                      <Badge variant="outline">
                        🌶️ Spicy
                      </Badge>
                    )}
                    {isUrgent && (
                      <Badge variant="destructive" className="animate-pulse">
                        ⚡ Urgent
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {timeLeft > 0 ? formatDistanceToNow(new Date(donation.expiry_time)) : 'Expired'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{donation.pickup_address}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedDonation === donation.id && (
                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">FULL PICKUP ADDRESS</p>
                      <p className="text-sm">{donation.pickup_address}</p>
                    </div>

                    {donation.food_type === 'animal_safe' && (
                      <div className="bg-orange-50 border border-orange-200 rounded p-3">
                        <p className="text-xs font-semibold text-orange-900 mb-1">Important Notes:</p>
                        <ul className="text-xs text-orange-900 space-y-1">
                          <li>• No spices or harmful additives</li>
                          <li>• Provide clear photo proof</li>
                          <li>• No OTP verification needed</li>
                        </ul>
                      </div>
                    )}

                    {donation.food_type === 'human_nonveg' && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-xs font-semibold text-blue-900">Recipient OTP: <span className="font-mono">7842</span></p>
                      </div>
                    )}

                    <Button
                      onClick={() => onAccept(donation.id)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Accept Delivery
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
