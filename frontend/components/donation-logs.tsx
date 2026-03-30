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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  'AVAILABLE': { label: 'Available', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: 'search' },
  'ASSIGNED': { label: 'Assigned', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: 'assigned' },
  'PICKED': { label: 'Picked Up', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: 'truck' },
  'DELIVERED': { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: 'check' },
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
            const config = STATUS_CONFIG[donation.status] || STATUS_CONFIG['AVAILABLE'];

            return (
              <div key={donation.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-card">
                {/* Header with status and title */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{donation.dish_name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{donation.food_category} • {donation.quantity_kg} kg</p>
                  </div>
                  <Badge className={config.color} variant="secondary">
                    {config.label}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {/* Created At */}
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Posted</span>
                    </div>
                    <p className="text-xs">{formatDistanceToNow(new Date(donation.created_at))} ago</p>
                  </div>

                  {/* Cooked Time */}
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Cooked At</span>
                    </div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-500">
                      {donation.cooked_time ? new Date(donation.cooked_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '—'}
                    </p>
                  </div>

                  {/* Volunteer assignment */}
                  {(donation.volunteer_id || donation.volunteers?.name) && (
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs">Volunteer</span>
                      </div>
                      <p className="text-xs truncate">{donation.volunteers?.name || 'Assigned ✓'}</p>
                    </div>
                  )}

                  {/* NGO Assignment */}
                  {(donation.ngo_id || donation.ngos?.name) && (
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">Destination</span>
                      </div>
                      <p className="text-xs truncate">{donation.ngos?.name || 'NGO Assigned'}</p>
                    </div>
                  )}
                </div>

                {/* Remarks special indicator */}
                {donation.restaurant_remark && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
                      ℹ️ {donation.restaurant_remark}
                    </Badge>
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
