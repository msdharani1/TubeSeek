
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RippleWaveLoader } from '@/components/ripple-wave-loader';
import { NewsClient } from '@/components/news-client';

export const metadata: Metadata = {
  title: 'Latest News',
  description: 'Stay informed with the latest news from around the world. Watch breaking news and in-depth reports on TubeSeek.',
  keywords: ['news', 'latest news', 'breaking news', 'world news', 'TubeSeek news'],
  openGraph: {
    title: 'Latest News | TubeSeek',
    description: 'Watch up-to-the-minute news coverage on TubeSeek.',
    type: 'website',
    url: '/news',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest News | TubeSeek',
    description: 'Get your daily news updates and watch reports on TubeSeek.',
  },
};

export default function NewsPageWrapper() {
   return (
      <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background"><RippleWaveLoader /><p className="mt-4 text-muted-foreground">Loading...</p></div>}>
          <NewsClient />
      </Suspense>
   )
}
