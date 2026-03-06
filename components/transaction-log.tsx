'use client';

import React from 'react';
import { Donation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Clock, TrendingUp, PawPrint } from 'lucide-react';

interface TransactionLogProps {
  donations: Donation[];
}

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  assigned: 'bg-blue-100 text-blue-800',
  picked: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-purple-100 text-purple-800',
};

export function TransactionLog({ donations }: TransactionLogProps) {
  const sortedDonations = [...donations].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Transaction Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Food Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Progress</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedDonations.map((donation) => {
                const progressSteps = ['available', 'assigned', 'picked', 'delivered'];
                const currentIndex = progressSteps.indexOf(donation.status);

                return (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{donation.food_name}</span>
                        {donation.food_type === 'animal_safe' && (
                          <PawPrint className="h-4 w-4 text-orange-500" title="Animal food" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{donation.quantity_kg} kg</TableCell>
                    <TableCell>
                      <Badge className={STATUS_BADGE[donation.status]}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {progressSteps.map((step, idx) => (
                          <div
                            key={step}
                            className={`h-2 w-8 rounded-full transition-colors ${
                              idx <= currentIndex ? 'bg-primary' : 'bg-muted'
                            }`}
                            title={step}
                          />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
