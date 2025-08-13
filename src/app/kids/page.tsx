
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RippleWaveLoader } from '@/components/ripple-wave-loader';
import { KidsClient } from '@/components/kids-client';

export const metadata: Metadata = {
  title: 'Kids Videos',
  description: 'A safe and fun selection of videos for kids. Watch cartoons, nursery rhymes, and educational content on TubeSeek.',
  keywords: ['kids videos', 'cartoons for kids', 'nursery rhymes', 'educational videos', 'TubeSeek kids'],
  openGraph: {
    title: 'Kids Videos | TubeSeek',
    description: 'Find fun and safe videos for children on TubeSeek.',
    type: 'website',
    url: '/kids',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kids Videos | TubeSeek',
    description: 'Entertaining and educational videos for kids on TubeSeek.',
  },
};


export default function KidsPageWrapper() {
   return (
      <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background"><RippleWaveLoader /><p className="mt-4 text-muted-foreground">Loading...</p></div>}>
          <KidsClient />
      </Suspense>
   )
}
