
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/search');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      // Don't log an error if the user closes the sign-in popup
      if (error.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error("Error signing in with Google: ", error);
    }
  };

  if (loading || user) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <div className="flex flex-col items-center gap-4 text-center">
            <Logo className="h-16 w-16 text-primary" />
            <h1 className="text-5xl font-bold tracking-tighter text-foreground font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                Welcome to TubeSeek
            </h1>
            <p className="max-w-md text-muted-foreground">
                Sign in to begin your intelligent search journey through YouTube.
            </p>
            <Button onClick={handleSignIn} size="lg" className="mt-6">
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.4 76.4c-24.1-23.4-55.2-39.6-96.5-39.6-69.9 0-126.5 56.1-126.5 125.1s56.6 125.1 126.5 125.1c79.1 0 106.5-63.5 111.1-96.2h-111.1v-90h214.4c2.8 12.7 4.5 26.1 4.5 40.8z"></path></svg>
                Sign in with Google
            </Button>
        </div>
    </main>
  );
}
