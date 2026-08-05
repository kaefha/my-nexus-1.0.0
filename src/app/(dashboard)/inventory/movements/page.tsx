'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function Page() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Movements</h1>
        <p className="text-muted-foreground text-sm mt-1">
          This module is currently under construction.
        </p>
      </div>
      
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Construction className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            We are actively building the Inventory Movements module. Please check back later or contact the administrator for more information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
