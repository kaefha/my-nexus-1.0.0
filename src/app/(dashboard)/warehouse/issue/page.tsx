'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PackageMinus } from 'lucide-react';

export default function MaterialIssuePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Material Issue</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Issue materials from the warehouse to project sites or transfers.
        </p>
      </div>
      
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <PackageMinus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            We are actively building the Material Issue module. Here you will be able to process material withdrawals for approved RFCs and Material Transfers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
