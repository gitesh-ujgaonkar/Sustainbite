'use client';

import React from 'react';
import { Donation } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, PawPrint, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DonationLogsProps {
  donations: Donation[];
}

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'bg-green-100 text-green-800', icon: 'search' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800', icon: 'assigned' },
  picked: { label: 'Picked Up', color: 'bg-yellow-100 text-yellow-800', icon: 'truck' },
  delivered: { label: 'Delivered', color: 'bg-purple-100 text-purple-800', icon: 'check' },
};

export function DonationLogs({ donations }: DonationLogsProps) {
  if (donations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="font-semibold">No donations yet</p>
          <p className="text-sm text-muted-foreground">Your donations will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Donations</CardTitle>
        <CardDescription>Track your donations and their delivery status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {donations.map((donation) => {
            const config = STATUS_CONFIG[donation.status];
            const timeLeft = new Date(donation.expiry_time).getTime() - Date.now();
            const isExpiring = timeLeft < 60 * 60 * 1000; // Less than 1 hour

            return (
              <div key={donation.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                {/* Header with status and title */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{donation.food_name}</h4>
                      {donation.food_type === 'animal_safe' && (
                        <PawPrint className="h-4 w-4 text-orange-500" title="Animal food" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{donation.quantity_kg} kg</p>
                  </div>
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {/* Pickup Location */}
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs">Pickup</span>
                    </div>
                    <p className="text-xs truncate">{donation.pickup_address}</p>
                  </div>

                  {/* Volunteer */}
                  {donation.volunteer_id && (
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs">Volunteer</span>
                      </div>
                      <p className="text-xs">Assigned ✓</p>
                    </div>
                  )}

                  {/* Time Left */}
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Expires</span>
                    </div>
                    <p className={`text-xs ${isExpiring ? 'text-red-600 font-semibold' : ''}`}>
                      {timeLeft > 0 ? formatDistanceToNow(new Date(donation.expiry_time)) : 'Expired'}
                    </p>
                  </div>

                  {/* Created */}
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Posted</span>
                    </div>
                    <p className="text-xs">{formatDistanceToNow(new Date(donation.created_at))} ago</p>
                  </div>
                </div>

                {/* Special Indicators */}
                <div className="flex flex-wrap gap-2">
                  {donation.is_spicy && donation.food_type !== 'animal_safe' && (
                    <Badge variant="outline" className="text-xs">🌶️ Spicy</Badge>
                  )}
                  {donation.food_type === 'animal_safe' && (
                    <Badge variant="outline" className="text-xs">🐾 Stray Feed</Badge>
                  )}
                  {isExpiring && (
                    <Badge variant="destructive" className="text-xs">⚠️ Expires Soon</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
