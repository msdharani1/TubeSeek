
import type { Metadata } from 'next';
import { LoginClient } from '@/components/login-client';

export const metadata: Metadata = {
  title: 'Login to TubeSeek',
  description: 'Sign in to TubeSeek to save your history, create playlists, and enjoy a personalized experience.',
  keywords: ['login', 'signin', 'tubeseek account', 'google login'],
  robots: {
    index: false,
    follow: false,
  },
   openGraph: {
    title: 'Login | TubeSeek',
    description: 'Sign in to access all features of TubeSeek.',
  },
};

export default function LoginPage() {
    return <LoginClient />;
}
