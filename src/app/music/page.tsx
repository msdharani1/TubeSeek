
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RippleWaveLoader } from '@/components/ripple-wave-loader';
import { MusicClient } from '@/components/music-client';

export const metadata: Metadata = {
  title: 'Music Videos',
  description: 'Explore a vast collection of music videos on TubeSeek. Find your favorite artists, new releases, and timeless classics.',
  keywords: ['music videos', 'new music', 'official videos', 'artists', 'TubeSeek music'],
   openGraph: {
    title: 'Music on TubeSeek',
    description: 'Listen to your favorite music and watch official videos.',
    type: 'website',
    url: '/music',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music Videos | TubeSeek',
    description: 'Find and watch the best music videos on TubeSeek.',
  },
};

export default function MusicPageWrapper() {
   return (
      <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background"><RippleWaveLoader /><p className="mt-4 text-muted-foreground">Loading...</p></div>}>
          <MusicClient />
      </Suspense>
   )
}
