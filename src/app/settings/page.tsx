
import type { Metadata } from 'next';
import { SettingsClient } from '@/components/settings-client';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your TubeSeek account settings, appearance, and data preferences. Clear your history, delete playlists, and more.',
  keywords: ['settings', 'account management', 'theme', 'data privacy', 'clear history'],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Settings | TubeSeek',
    description: 'Customize your experience and manage your data.',
  },
};

export default function SettingsPage() {
    return <SettingsClient />;
}
