'use client';

import React, { useState } from 'react';
import { HungerStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HungerStatusToggleProps {
  currentStatus: HungerStatus;
  onChange: (status: HungerStatus) => void;
  peopleCount: number;
}

const STATUSES = {
  critical: {
    label: 'Critical Need',
    color: 'bg-red-100 border-red-300 text-red-900',
    icon: AlertTriangle,
    description: 'Urgently need food assistance. Highest priority for donations.',
    emoji: '🔴',
  },
  open: {
    label: 'Accepting Donations',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    icon: AlertCircle,
    description: 'Accepting donations as available. Steady need.',
    emoji: '🟡',
  },
  full: {
    label: 'Fully Stocked',
    color: 'bg-green-100 border-green-300 text-green-900',
    icon: CheckCircle2,
    description: 'Currently fully stocked. Not in donation queue.',
    emoji: '🟢',
  },
};

export function HungerStatusToggle({
  currentStatus,
  onChange,
  peopleCount,
}: HungerStatusToggleProps) {
  const [selectedStatus, setSelectedStatus] = useState<HungerStatus>(currentStatus);

  const handleStatusChange = (status: HungerStatus) => {
    setSelectedStatus(status);
    onChange(status);
  };

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <CardTitle>Hunger Status</CardTitle>
        <CardDescription>
          Update your organization's current need level for donations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status Display */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Current Status</p>
          <div className={`p-4 rounded-lg border-2 ${STATUSES[selectedStatus].color}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{STATUSES[selectedStatus].emoji}</span>
              <div>
                <p className="font-bold text-lg">{STATUSES[selectedStatus].label}</p>
                <p className="text-sm opacity-90">Serving {peopleCount} people</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <Alert className="bg-primary/5 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {STATUSES[selectedStatus].description}
          </AlertDescription>
        </Alert>

        {/* Status Selection */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Switch Status</p>
          <div className="grid grid-cols-1 gap-3">
            {(Object.keys(STATUSES) as HungerStatus[]).map((status) => {
              const config = STATUSES[status];
              const Icon = config.icon;
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedStatus === status
                      ? `${config.color} border-current ring-2 ring-offset-2 ring-primary`
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">{config.label}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {status === 'critical' && 'Highest priority - We urgently need donations'}
                        {status === 'open' && 'Normal operations - Accepting donations as needed'}
                        {status === 'full' && 'We have enough - No donations needed right now'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Impact Notes */}
        <Alert className={selectedStatus === 'full' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {selectedStatus === 'full'
              ? 'Your organization will not appear in volunteer pickup assignments. Update when needs change.'
              : 'Your status is visible to donors and volunteers. They can prioritize donations based on your needs.'}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
