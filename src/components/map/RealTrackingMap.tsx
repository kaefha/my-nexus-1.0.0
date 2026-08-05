'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-100 animate-pulse rounded-xl flex flex-col items-center justify-center border border-slate-200">
      <div className="w-10 h-10 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <div className="text-slate-500 font-medium">Loading interactive map...</div>
    </div>
  )
});

export default function RealTrackingMap({ selectedDO }: { selectedDO: any }) {
  return <MapComponent selectedDO={selectedDO} />;
}
