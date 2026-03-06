'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { db } from '@/lib/db_mock';

export function HeroSection() {
  const [mealsSaved, setMealsSaved] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const meals = db.getMealsSavedCount();
    setMealsSaved(meals);

    // Animated counter
    let current = 0;
    const increment = Math.max(1, Math.floor(meals / 50));
    const timer = setInterval(() => {
      if (current < meals) {
        current = Math.min(current + increment, meals);
        setCount(current);
      } else {
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container">
        <div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Leaf className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">SustainBite Platform</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Stop Waste,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Feed Hunger
                </span>
              </h1>

              <p className="text-lg text-muted-foreground text-balance max-w-lg">
                Connect restaurants and donors with surplus food to volunteers and NGOs in need.
                Transform food waste into meaningful impact while building a community of change-makers.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-border">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">{count.toLocaleString()}+</div>
                <p className="text-sm text-muted-foreground mt-1">Meals Saved</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary">5,000+</div>
                <p className="text-sm text-muted-foreground mt-1">Community Members</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                  Start Contributing <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#verify">
                <Button size="lg" variant="outline">
                  Verify Certificate
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="text-xs text-muted-foreground">
                ✓ Free to Use
              </div>
              <div className="text-xs text-muted-foreground">
                ✓ Verified Impact
              </div>
              <div className="text-xs text-muted-foreground">
                ✓ Secure Platform
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative h-96 md:h-[500px]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 overflow-hidden">
              {/* Floating cards animation */}
              <div className="absolute top-10 left-10 p-4 bg-background border border-border rounded-lg shadow-lg max-w-xs">
                <div className="text-sm font-semibold text-primary mb-1">Fresh Vegetables</div>
                <div className="text-xs text-muted-foreground">8 kg available • Expires in 2h</div>
              </div>

              <div className="absolute bottom-20 right-10 p-4 bg-background border border-border rounded-lg shadow-lg max-w-xs">
                <div className="text-sm font-semibold text-secondary mb-1">Volunteer Matched</div>
                <div className="text-xs text-muted-foreground">Pickup confirmed • On the way</div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Leaf className="h-32 w-32 text-primary/20 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
