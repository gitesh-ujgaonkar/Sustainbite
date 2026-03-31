'use client';

import React, { useState } from 'react';
import { Donation } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, AlertCircle, Trash2, Edit2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter out cancelled items so they don't clog the active board!
  const activeDonations = donations.filter(d => d.status !== 'CANCELLED');

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/deliveries/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to delete donation.');
      }
      toast.success('Donation deleted successfully.');
      // The array updates instantly because of the useRealtimeDeliveries hook catching the UPDATE event (status='CANCELLED')!
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete donation.');
    } finally {
      setDeletingId(null);
    }
  };

  if (activeDonations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 text-center flex flex-col items-center justify-center min-h-[200px]">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="font-semibold">No active donations</p>
          <p className="text-sm text-muted-foreground">Your listed donations will appear here</p>
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
          {activeDonations.map((donation) => {
            const config = STATUS_CONFIG[donation.status] || STATUS_CONFIG['AVAILABLE'];

            return (
              <div key={donation.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-card relative group">
                {/* Header with status and title */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{donation.dish_name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{donation.food_category} • {donation.quantity_kg} kg</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={config.color} variant="secondary">
                      {config.label}
                    </Badge>
                    
                    {/* Action Buttons (Only visible if AVAILABLE) */}
                    {donation.status === 'AVAILABLE' && (
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        
                        {/* Edit Action */}
                        <EditDonationDialog donation={donation} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                              {deletingId === donation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Donation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to withdraw this food donation? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(donation.id)} className="bg-destructive hover:bg-destructive/90 text-white">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
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

                {/* Special Indicators */}
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border/50">
                  {donation.status === 'ASSIGNED' && donation.pickup_otp && (
                    <div className="w-full mb-1">
                      <span className="inline-flex items-center gap-1.5 font-mono bg-amber-500/20 text-amber-600 dark:text-amber-500 px-3 py-1.5 rounded-md text-sm font-bold border border-amber-500/30">
                        🔑 Pickup OTP: {donation.pickup_otp}
                      </span>
                    </div>
                  )}
                  {donation.restaurant_remark && (
                    <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
                      ℹ️ {donation.restaurant_remark}
                    </Badge>
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

// ── Edit Donation Dialog Component ─────────────────────────────────
function EditDonationDialog({ donation }: { donation: Donation }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dishName: donation.dish_name,
    foodCategory: donation.food_category,
    quantityKg: donation.quantity_kg.toString(),
    restaurantRemark: donation.restaurant_remark || ''
  });

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/deliveries/${donation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          dish_name: formData.dishName,
          food_category: formData.foodCategory,
          quantity_kg: parseFloat(formData.quantityKg),
          restaurant_remark: formData.restaurantRemark
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to update donation.');
      }
      
      toast.success('Donation updated successfully.');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update donation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Donation</DialogTitle>
          <DialogDescription>
            Make changes to your listing. Only active AVAILABLE donations can be edited.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEdit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="dishName">Dish Name</Label>
            <Input 
              id="dishName"
              value={formData.dishName} 
              onChange={e => setFormData({ ...formData, dishName: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="foodCategory">Food Category</Label>
            <Input 
              id="foodCategory"
              value={formData.foodCategory} 
              onChange={e => setFormData({ ...formData, foodCategory: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantityKg">Quantity (kg)</Label>
            <Input 
              id="quantityKg"
              type="number" 
              step="0.1"
              min="0.1"
              value={formData.quantityKg} 
              onChange={e => setFormData({ ...formData, quantityKg: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantRemark">Instructions for Volunteer (Optional)</Label>
            <Input 
              id="restaurantRemark"
              placeholder="e.g. Come to the back door"
              value={formData.restaurantRemark} 
              onChange={e => setFormData({ ...formData, restaurantRemark: e.target.value })} 
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
