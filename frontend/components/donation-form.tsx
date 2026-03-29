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
  const [isAnimalFeed, setIsAnimalFeed] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);
  const [isNonVeg, setIsNonVeg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '',
    pickupAddress: '',
    expiryTime: '',
    description: '',
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

      let foodTypeEnum = 'human_veg';
      if (isAnimalFeed) foodTypeEnum = 'animal_safe';
      else if (isNonVeg) foodTypeEnum = 'human_nonveg';

      const fullDesc = `${formData.foodName} ${isSpicy ? '(Spicy)' : ''} - ${formData.description}`;

      const res = await fetch(`${API_BASE}/api/v1/deliveries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          food_type: foodTypeEnum,
          quantity_kg: parseFloat(formData.quantity),
          food_description: fullDesc,
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
          setFormData({ foodName: '', quantity: '', pickupAddress: '', expiryTime: '', description: '' });
          setIsAnimalFeed(false);
          setIsSpicy(false);
          setIsNonVeg(false);
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

          {/* Animal Feed Toggle */}
          <Alert className="bg-secondary/10 border-secondary/30">
            <PawPrint className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-3">
                <span className="text-sm">Is this food for animals?</span>
                <button
                  type="button"
                  onClick={() => setIsAnimalFeed(!isAnimalFeed)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAnimalFeed ? 'bg-secondary' : 'bg-muted'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnimalFeed ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Food Name */}
          <div className="space-y-2">
            <Label htmlFor="foodName">Food Name *</Label>
            <Input
              id="foodName"
              placeholder={isAnimalFeed ? 'e.g., Chicken Scraps, Rice Trimmings' : 'e.g., Pizza, Vegetables, Cooked Rice'}
              value={formData.foodName}
              onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
              required
            />
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

          {/* Spice and Diet Level - Only for human food */}
          {!isAnimalFeed && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Diet Type</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNonVeg(false)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${!isNonVeg
                        ? 'bg-green-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNonVeg(true)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${isNonVeg
                        ? 'bg-red-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    Non-Veg
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Spice Level</Label>
                <div className="flex gap-2 flex-wrap">
                  {['Not Spicy', 'Mild', 'Medium', 'Very Spicy'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setIsSpicy(level !== 'Not Spicy')}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${(level !== 'Not Spicy' ? isSpicy : !isSpicy)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any allergies, ingredients, or special handling instructions?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Image Upload Placeholder */}
          <div className="space-y-2">
            <Label>Food Photo (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
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
