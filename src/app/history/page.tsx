
import type { Metadata } from 'next';
import { HistoryClient } from '@/components/history-client';

export const metadata: Metadata = {
  title: 'Watch History',
  description: 'Review your watch history on TubeSeek. Easily find and re-watch videos you\'ve seen before.',
  keywords: ['watch history', 'video history', 'recently watched'],
  robots: {
    index: false,
    follow: false,
  },
   openGraph: {
    title: 'Watch History | TubeSeek',
    description: 'Keep track of the videos you watch.',
  },
};

export default function HistoryPage() {
    return <HistoryClient />;
}
