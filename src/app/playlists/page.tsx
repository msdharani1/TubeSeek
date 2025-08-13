
import type { Metadata } from 'next';
import { PlaylistsClient } from '@/components/playlists-client';

export const metadata: Metadata = {
  title: 'My Playlists',
  description: 'Create, manage, and watch your custom video playlists. Organize your favorite content exactly how you want.',
  keywords: ['my playlists', 'video playlists', 'custom playlists', 'TubeSeek playlists'],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'My Playlists | TubeSeek',
    description: 'View and manage your video playlists on TubeSeek.',
  },
};

export default function PlaylistsPage() {
    return <PlaylistsClient />;
}
