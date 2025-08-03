
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
                 <Image 
                    src="https://res.cloudinary.com/diwu3avy6/image/upload/google_logo_2025_tqgvc7?_a=DATAdtAAZAA0" 
                    alt="Google logo"
                    width={24}
                    height={24}
                    className="mr-2"
                 />
                Sign in with Google
            </Button>
        </div>
    </main>
  );
}
