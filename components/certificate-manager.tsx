'use client';

import React, { useState } from 'react';
import { User, Certificate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Award, Plus } from 'lucide-react';

interface CertificateManagerProps {
  users: User[];
  certificates: Certificate[];
}

const MILESTONES = [
  { value: 'bronze', label: 'Bronze Contributor (50kg)', kg: 50 },
  { value: 'silver', label: 'Silver Champion (100kg)', kg: 100 },
  { value: 'gold', label: 'Gold Hero (250kg)', kg: 250 },
  { value: 'platinum', label: 'Platinum Legend (500kg)', kg: 500 },
];

const BADGE_COLORS: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-800',
  silver: 'bg-gray-100 text-gray-800',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-indigo-100 text-indigo-800',
};

export function CertificateManager({
  users,
  certificates,
}: CertificateManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [milestone, setMilestone] = useState('');
  const [issuing, setIssuing] = useState(false);

  const handleIssueCertificate = async () => {
    if (!selectedUser || !milestone) {
      alert('Please select both user and milestone');
      return;
    }

    setIssuing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`[v0] Certificate issued: ${milestone} to user ${selectedUser}`);
    
    setIssuing(false);
    setOpen(false);
    setSelectedUser('');
    setMilestone('');
  };

  const donorUsers = users.filter(u => u.role === 'donor' || u.role === 'volunteer');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certificate Manager
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" />
              Issue Certificate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue New Certificate</DialogTitle>
              <DialogDescription>
                Manually issue a certificate to recognize user contributions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {donorUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="milestone">Milestone</Label>
                <Select value={milestone} onValueChange={setMilestone}>
                  <SelectTrigger id="milestone">
                    <SelectValue placeholder="Select milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    {MILESTONES.map(m => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleIssueCertificate}
                disabled={issuing}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {issuing ? 'Issuing...' : 'Issue Certificate'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Milestone</TableCell>
                <TableCell>Badge</TableCell>
                <TableCell>Issued Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.map((cert) => {
                const user = users.find(u => u.id === cert.user_id);
                return (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{user?.name}</TableCell>
                    <TableCell>{cert.milestone_name}</TableCell>
                    <TableCell>
                      <Badge className={BADGE_COLORS[cert.badge_color]}>
                        {cert.badge_color.charAt(0).toUpperCase() + cert.badge_color.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(cert.issued_date).toLocaleDateString()}
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
