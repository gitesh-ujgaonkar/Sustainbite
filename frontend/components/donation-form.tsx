'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FoodType } from '@/lib/types';
import { Upload, AlertCircle, PawPrint, CheckCircle2 } from 'lucide-react';

interface DonationFormProps {
  onSubmit?: (data: any) => void;
}

export function DonationForm({ onSubmit }: DonationFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    dishName: '',
    foodCategory: 'Vegetarian',
    quantity: '',
    restaurantRemark: '',
    pickupAddress: '',
    expiryTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const { supabase } = await import('@/lib/supabase');
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          dish_name: formData.dishName,
          food_category: formData.foodCategory,
          quantity_kg: parseFloat(formData.quantity),
          restaurant_remark: formData.restaurantRemark,
          pickup_address: formData.pickupAddress,
          expiry_time: parseFloat(formData.expiryTime || '2'),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to list donation.');
      }

      if (onSubmit) {
        onSubmit(formData);
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);

      if (!errorMsg) {
        // Reset after 3 seconds on success
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ dishName: '', foodCategory: 'Vegetarian', quantity: '', restaurantRemark: '', pickupAddress: '', expiryTime: '' });
        }, 3000);
      }
    }
  };

  if (submitted) {
    return (
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="pt-8 text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary animate-bounce" />
          </div>
          <div>
            <p className="text-lg font-semibold text-primary">Donation Listed!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your {formData.quantity}kg donation is now visible to volunteers.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Redirecting to your dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donate Food Now</CardTitle>
        <CardDescription>Share your surplus food with those in need</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Dish Name */}
          <div className="space-y-2">
            <Label htmlFor="dishName">Dish or Food Name *</Label>
            <Input
              id="dishName"
              placeholder="e.g., Leftover Pizza, Bagels, Surplus Rice"
              value={formData.dishName}
              onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
              required
            />
          </div>

          {/* Food Category Enum Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="foodCategory">Food Category *</Label>
            <Select
              value={formData.foodCategory}
              onValueChange={(val) => setFormData({ ...formData, foodCategory: val })}
            >
              <SelectTrigger id="foodCategory">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                <SelectItem value="Baked Goods">Baked Goods</SelectItem>
                <SelectItem value="Animal Feed">Animal Feed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (kg) *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="e.g., 5"
                min="0.5"
                step="0.5"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expires In (hours) *</Label>
              <Select defaultValue="2">
                <SelectTrigger id="expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">30 minutes</SelectItem>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Strict Enum Handled by Category Dropdown */}

          {/* Pickup Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Pickup Address *</Label>
            <Input
              id="address"
              placeholder="Street address, building, suite number"
              value={formData.pickupAddress}
              onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
              required
            />
          </div>

          {/* Restaurant Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remark">Additional Handling Instructions (Optional)</Label>
            <Textarea
              id="remark"
              placeholder="Any special pickup details, allergies, or storage conditions..."
              value={formData.restaurantRemark}
              onChange={(e) => setFormData({ ...formData, restaurantRemark: e.target.value })}
            />
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-6" disabled={loading}>
            {loading ? 'Listing donation...' : 'List This Donation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
