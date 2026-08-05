'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Layers } from 'lucide-react';

export default function StockMonitoringPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Monitoring</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor real-time inventory levels across all warehouse locations.
        </p>
      </div>
      
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            We are actively building the Stock Monitoring module. Here you will be able to see detailed stock balances per warehouse, minimum stock alerts, and bin locations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
