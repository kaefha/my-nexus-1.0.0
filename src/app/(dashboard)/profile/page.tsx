'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user } = useAuth();

  const getRoleLabel = (role: string) => {
    return role?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'User';
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const split = name.split(' ');
    if (split.length > 1) return (split[0][0] + split[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your personal details and role within the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-muted">
              <AvatarFallback className="text-3xl font-semibold bg-primary/10 text-primary">
                {getUserInitials(user?.name || '')}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl font-bold">{user?.name || 'Loading...'}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="pt-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {getRoleLabel(user?.role || '')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
