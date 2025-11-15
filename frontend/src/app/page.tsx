'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import map component to avoid SSR issues with mapbox-gl
const MapContainer = dynamic(() => import('@/components/Map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading Project Terminus...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Initializing Global Dashboard...</p>
          </div>
        </div>
      }>
        <MapContainer />
      </Suspense>
    </main>
  );
}
