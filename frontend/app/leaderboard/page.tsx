'use client';

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Trophy, TrendingUp, Medal, Loader2, Users, Store } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Leader {
  id: string;
  name: string;
  green_points: number;
}

interface LeaderboardData {
  top_volunteers: Leader[];
  top_restaurants: Leader[];
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_BASE}/api/v1/stats/leaderboard`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (index: number) => {
    if (index === 0) return <span className="text-2xl" title="Gold">🥇</span>;
    if (index === 1) return <span className="text-2xl" title="Silver">🥈</span>;
    if (index === 2) return <span className="text-2xl" title="Bronze">🥉</span>;
    return <span className="text-lg font-bold text-muted-foreground w-8 text-center">{index + 1}</span>;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 shadow-sm';
    if (index === 1) return 'border-gray-300 bg-gray-50 dark:bg-gray-800/30';
    if (index === 2) return 'border-amber-600 bg-amber-50 dark:bg-amber-900/10';
    return 'border-transparent bg-background hover:bg-muted/50';
  };

  const LeaderList = ({ items, emptyMsg }: { items: Leader[], emptyMsg: string }) => {
    if (!items || items.length === 0) {
      return <div className="text-center p-8 text-muted-foreground italic bg-muted/20 rounded-xl">{emptyMsg}</div>;
    }

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${getRankStyle(index)}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10">
                {getRankBadge(index)}
              </div>
              <div>
                <h3 className={`font-bold ${index < 3 ? 'text-lg text-foreground' : 'text-base text-muted-foreground'}`}>
                  {item.name || "Anonymous Hero"}
                </h3>
              </div>
            </div>
            
            <div className={`flex items-center gap-1.5 font-mono font-bold ${index === 0 ? 'text-yellow-600 dark:text-yellow-500' : 'text-emerald-600'}`}>
              <TrendingUp className="h-4 w-4" />
              {item.green_points.toLocaleString()} pts
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-full mb-4 shadow-sm">
            <Trophy className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-emerald-950 dark:text-emerald-50 tracking-tight">
            The Hunger Signal: Wall of Impact
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recognizing the top contributing restaurants and volunteers dedicating their resources to eliminate hunger and protect our planet.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Volunteers Column */}
            <Card className="border-emerald-100 dark:border-zinc-800 shadow-md">
              <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-zinc-800 pb-6 rounded-t-xl">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 rounded-lg text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  Top Volunteers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <LeaderList 
                  items={data?.top_volunteers || []} 
                  emptyMsg="No volunteers have earned points yet." 
                />
              </CardContent>
            </Card>

            {/* Restaurants Column */}
            <Card className="border-blue-100 dark:border-zinc-800 shadow-md">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-zinc-800 pb-6 rounded-t-xl">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <Store className="h-5 w-5" />
                  </div>
                  Top Restaurants
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <LeaderList 
                  items={data?.top_restaurants || []} 
                  emptyMsg="No restaurants have earned points yet." 
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
