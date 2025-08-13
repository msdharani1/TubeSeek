
import type { Metadata } from 'next';
import { PlaylistDetailClient } from '@/components/playlist-detail-client';

type Props = {
  params: { playlistId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Since we cannot fetch user-specific data on the server, we provide a generic title.
  // The client-side usePageTitle hook will set a more specific title.
  return {
    title: 'Viewing Playlist',
    description: 'Watch videos from one of your custom playlists on TubeSeek.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function PlaylistDetailPage() {
    return <PlaylistDetailClient />;
}
