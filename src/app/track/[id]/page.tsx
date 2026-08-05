'use client';

import { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { useParams } from 'next/navigation';

export default function DriverTrackingPage() {
  const params = useParams();
  const doId = params.id as string;

  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'tracking' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('tracking');
    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        
        try {
          await api.post(`/api/logistics/${doId}/tracking`, { latitude, longitude });
          setLastUpdate(new Date());
          setStatus('success');
        } catch (error) {
          console.error("Failed to sync location", error);
          setStatus('error');
          setErrorMsg('Failed to sync location to server. Retrying...');
        }
      },
      (error) => {
        setStatus('error');
        setIsTracking(false);
        setErrorMsg(`GPS Error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    setIsTracking(false);
    setStatus('idle');
    setWatchId(null);
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Delivery Tracking</CardTitle>
          <CardDescription>
            ID: {doId?.slice(0, 8)}...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-2">Instructions</h3>
            <p className="text-sm text-slate-500">
              Please click "Start Tracking" below and leave this page open while you drive. 
              Your phone will automatically send your location to the central dashboard.
            </p>
          </div>

          {!isTracking ? (
            <Button 
              size="lg" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-14"
              onClick={startTracking}
            >
              <MapPin className="mr-2 h-5 w-5" /> Start Tracking
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-100 rounded-xl animate-pulse" />
                <div className="relative bg-white border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <div className="text-left flex-1">
                    <p className="font-bold text-emerald-700">Tracking Active</p>
                    <p className="text-xs text-emerald-600 font-mono">
                      {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Waiting for GPS...'}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="destructive"
                size="lg" 
                className="w-full h-12"
                onClick={stopTracking}
              >
                Stop Tracking
              </Button>
            </div>
          )}

          {status === 'success' && lastUpdate && (
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              Last synced: {lastUpdate.toLocaleTimeString()}
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-left">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isTracking && !coords && status !== 'error' && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Acquiring GPS signal...
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
