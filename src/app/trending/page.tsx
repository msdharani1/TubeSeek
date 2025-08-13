
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RippleWaveLoader } from '@/components/ripple-wave-loader';
import { TrendingClient } from '@/components/trending-client';

export const metadata: Metadata = {
  title: 'Trending Videos',
  description: 'Watch the latest and most popular trending videos from around the world. Stay up-to-date with what\'s hot on TubeSeek.',
  keywords: ['trending videos', 'popular videos', 'viral content', 'hot videos', 'TubeSeek trending'],
  openGraph: {
    title: 'Trending Videos | TubeSeek',
    description: 'Discover what\'s currently trending on TubeSeek.',
    type: 'website',
    url: '/trending',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending Videos | TubeSeek',
    description: 'Watch the latest viral content and popular videos on TubeSeek.',
  },
};


export default function TrendingPageWrapper() {
   return (
      <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background"><RippleWaveLoader /><p className="mt-4 text-muted-foreground">Loading...</p></div>}>
          <TrendingClient />
      </Suspense>
   )
}
