import { Suspense } from 'react';
import PlaceDetailClient from './PlaceDetailClient';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-8">
          <div className="w-8 h-8 border-3 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
        </div>
      }
    >
      <PlaceDetailClient id={id} />
    </Suspense>
  );
}
