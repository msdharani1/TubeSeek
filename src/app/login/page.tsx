
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';

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
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        return;
      }
          // auth/popup-blocked error is caused by browser settings.
          // The user needs to allow popups for this site.
      console.error("Error signing in with Google: ", error);
    }
  };

  if (loading || user) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              No ads, no shorts, no distractions. Your focused portal to YouTube. Sign in to begin.
            </p>
            <Button onClick={handleSignIn} size="lg" className="mt-6">
                 <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 261.8 0 123.8 111.8 14.5 244 14.5c72.6 0 134.3 29.1 179.9 76.2L349.8 169.8c-38.3-36.4-86.8-59.4-142-59.4-106.3 0-192.2 86-192.2 192.2s85.9 192.2 192.2 192.2c101.5 0 178.2-71.4 186.8-166.5H244V261.8h244z"></path></svg>
                Sign in with Google
            </Button>
        </div>
    </main>
  );
}
