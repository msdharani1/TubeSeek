
import type { Metadata } from 'next';
import { LikedVideosClient } from '@/components/liked-videos-client';

export const metadata: Metadata = {
  title: 'Liked Videos',
  description: 'Find all the videos you have liked on TubeSeek. Your personal collection of favorite content, all in one place.',
  keywords: ['liked videos', 'favorite videos', 'saved videos'],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Liked Videos | TubeSeek',
    description: 'Revisit all the videos you\'ve liked on TubeSeek.',
  },
};

export default function LikedVideosPage() {
    return <LikedVideosClient />;
}
