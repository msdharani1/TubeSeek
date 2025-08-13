
import type { Metadata } from 'next';
import { SubscriptionsClient } from '@/components/subscriptions-client';

export const metadata: Metadata = {
  title: 'My Subscriptions',
  description: 'Manage your channel subscriptions on TubeSeek. Keep up with your favorite creators and never miss an update.',
  keywords: ['my subscriptions', 'channel subscriptions', 'favorite creators'],
  robots: {
    index: false,
    follow: false,
  },
   openGraph: {
    title: 'My Subscriptions | TubeSeek',
    description: 'Manage your channel subscriptions.',
  },
};

export default function SubscriptionsPage() {
    return <SubscriptionsClient />;
}
