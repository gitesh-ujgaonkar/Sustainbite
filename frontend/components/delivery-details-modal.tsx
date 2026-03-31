'use client';

import React from 'react';
import { Donation } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, Eye, Phone, Map, AlertCircle, Info, Navigation2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeliveryDetailsModalProps {
  donation: Donation;
  trigger?: React.ReactNode;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'AVAILABLE': { label: 'Available Pipeline', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' },
  'ASSIGNED': { label: 'Assigned Driver', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
  'PICKED': { label: 'In Transit', color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' },
  'DELIVERED': { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
  'CANCELLED': { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
};

export function DeliveryDetailsModal({ donation, trigger }: DeliveryDetailsModalProps) {
  const config = STATUS_CONFIG[donation.status] || STATUS_CONFIG['AVAILABLE'];

  const openGoogleMaps = () => {
    if (donation.pickup_address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donation.pickup_address)}`, '_blank');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" /> View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[90vh] md:h-auto overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {donation.dish_name}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {donation.food_category} • {donation.quantity_kg} kg Food Rescue
              </DialogDescription>
            </div>
            <Badge className={`ml-4 ${config.color}`} variant="outline">
              {config.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timeline View */}
          <div className="bg-muted/50 rounded-lg p-4 border relative">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
              <Clock className="h-4 w-4" /> Log Timeline
            </h4>
            <div className="space-y-4 pl-2 border-l-2 border-border ml-2">
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background"></div>
                <p className="font-medium text-sm">Preparation Cooked</p>
                <p className="text-xs text-muted-foreground">
                  {donation.cooked_time ? new Date(donation.cooked_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'Unknown Time'}
                </p>
              </div>
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background"></div>
                <p className="font-medium text-sm">Posted to System</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(donation.created_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              </div>
              {donation.status !== 'AVAILABLE' && donation.status !== 'CANCELLED' && (
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background"></div>
                  <p className="font-medium text-sm">Assigned & Claimed</p>
                  <p className="text-xs text-muted-foreground">
                    Assigned to <span className="font-bold">{donation.volunteers?.name || 'Authorized Volunteer'}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Grid Layout for Actors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Restaurant Details */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Pick-Up Origin
              </h4>
              <div>
                <p className="font-bold">{donation.restaurants?.name || 'Local Restaurant'}</p>
                {donation.pickup_address && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{donation.pickup_address}</p>
                )}
              </div>
              
              {/* Only show raw contact / address maps if claimed or higher, OR if we are the restaurant viewing our own */}
              <div className="pt-2 flex flex-col gap-2">
                {donation.pickup_address && (
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs text-blue-600 dark:text-blue-400" onClick={openGoogleMaps}>
                    <Navigation2 className="h-3 w-3 mr-2" /> 📍 Open in Google Maps
                  </Button>
                )}
                {/* Contact only available to Authorized Claimers */}
                {['ASSIGNED', 'PICKED', 'DELIVERED'].includes(donation.status) && donation.restaurants?.phone && (
                   <div className="flex items-center gap-2 mt-2 text-sm font-medium">
                     <Phone className="h-4 w-4 text-green-600" />
                     <a href={`tel:${donation.restaurants.phone}`} className="hover:underline">{donation.restaurants.phone}</a>
                   </div>
                )}
              </div>
            </div>

            {/* Volunteer Details */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> Assigned Courier
              </h4>
              {donation.volunteer_id || donation.volunteers?.name ? (
                <>
                  <div>
                    <p className="font-bold">{donation.volunteers?.name || 'Verified Courier'}</p>
                    <p className="text-sm text-muted-foreground mt-1">Status: {config.label}</p>
                  </div>
                  {/* Show Courier phone only to specific status */}
                  {['ASSIGNED', 'PICKED', 'DELIVERED'].includes(donation.status) && donation.volunteers?.phone && (
                     <div className="flex items-center gap-2 mt-2 text-sm font-medium pt-2">
                       <Phone className="h-4 w-4 text-green-600" />
                       <a href={`tel:${donation.volunteers.phone}`} className="hover:underline">{donation.volunteers.phone}</a>
                     </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground text-sm opacity-60">
                  <User className="h-8 w-8 mb-2" />
                  <p>Awaiting Volunteer</p>
                </div>
              )}
            </div>
          </div>

          {/* Special Remarks / Instructions Box */}
          {donation.restaurant_remark && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="text-amber-800 dark:text-amber-500 font-semibold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Info className="h-4 w-4" /> Restaurant Instructions
              </h4>
              <p className="text-sm text-amber-900 dark:text-amber-200">
                {donation.restaurant_remark}
              </p>
            </div>
          )}
          
        </div>
      </DialogContent>
    </Dialog>
  );
}
