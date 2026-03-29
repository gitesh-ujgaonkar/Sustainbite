'use client';

import React from 'react';
import { Donation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Truck, CheckCircle2, PawPrint, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IncomingDonationsProps {
  donations: Donation[];
}

export function IncomingDonations({ donations }: IncomingDonationsProps) {
  const incomingDonations = donations.filter(
    d => d.status === 'assigned' || d.status === 'picked'
  );

  if (incomingDonations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 text-center">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="font-semibold">No Incoming Donations</p>
          <p className="text-sm text-muted-foreground">New donations will appear here when assigned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-secondary" />
          Incoming Donations ({incomingDonations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incomingDonations.map((donation) => (
            <div key={donation.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{donation.food_name}</h4>
                    {donation.food_type === 'animal_safe' && (
                      <PawPrint className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <p className="text-sm text-secondary font-bold">{donation.quantity_kg} kg</p>
                </div>
                <Badge
                  className={
                    donation.status === 'picked'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }
                >
                  {donation.status === 'picked' ? '📦 Out for Delivery' : '⏱️ Being Picked Up'}
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="text-xs">Coming from: {donation.pickup_address}</span>
                </div>

                <div className="flex items-start gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-secondary" />
                  <span className="text-xs">
                    {donation.status === 'picked'
                      ? `Will arrive in ~30 minutes`
                      : `Volunteer is on the way (~${Math.random() > 0.5 ? 15 : 10} min to pickup)`}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {donation.is_spicy && donation.food_type !== 'animal_safe' && (
                  <Badge variant="outline" className="text-xs">🌶️ Contains Spice</Badge>
                )}
                {donation.food_type === 'animal_safe' && (
                  <Badge variant="outline" className="text-xs">🐾 Animal Food</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
