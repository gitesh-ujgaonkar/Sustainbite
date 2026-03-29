'use client';

import React, { useState } from 'react';
import { User, VerifiedStatus, UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, Ban, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

interface UserManagementProps {
  users: User[];
}

const ROLE_COLORS: Record<UserRole, string> = {
  donor: 'bg-blue-100 text-blue-800',
  volunteer: 'bg-green-100 text-green-800',
  ngo: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<VerifiedStatus, any> = {
  verified: { icon: CheckCircle2, color: 'text-green-600', label: 'Verified' },
  unverified: { icon: AlertCircle, color: 'text-yellow-600', label: 'Pending' },
  banned: { icon: Ban, color: 'text-red-600', label: 'Banned' },
};

export function UserManagement({ users }: UserManagementProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'verify' | 'ban' | 'delete' | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleAction = (user: User, actionType: 'verify' | 'ban' | 'delete') => {
    setSelectedUser(user);
    setAction(actionType);
    setShowDialog(true);
  };

  const confirmAction = () => {
    console.log(`[v0] Admin action: ${action} on user ${selectedUser?.id}`);
    setShowDialog(false);
    setSelectedUser(null);
    setAction(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const StatusIcon = STATUS_ICONS[user.verified_status].icon;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[user.role]}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <StatusIcon
                            className={`h-4 w-4 ${STATUS_ICONS[user.verified_status].color}`}
                          />
                          <span className="text-sm">
                            {STATUS_ICONS[user.verified_status].label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{user.points}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.verified_status !== 'verified' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(user, 'verify')}
                              className="text-xs"
                            >
                              Verify
                            </Button>
                          )}
                          {user.verified_status !== 'banned' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAction(user, 'ban')}
                              className="text-xs"
                            >
                              Ban
                            </Button>
                          )}
                          {user.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAction(user, 'delete')}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === 'verify' && 'Verify User Account?'}
              {action === 'ban' && 'Ban User Account?'}
              {action === 'delete' && 'Delete User Account?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'verify' && `Verify ${selectedUser?.name}'s account. They will gain access to all features.`}
              {action === 'ban' && `Ban ${selectedUser?.name}. They will not be able to use the platform.`}
              {action === 'delete' && `Delete ${selectedUser?.name}'s account. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmAction}
            className={action === 'ban' || action === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {action === 'verify' && 'Verify'}
            {action === 'ban' && 'Ban User'}
            {action === 'delete' && 'Delete Account'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
