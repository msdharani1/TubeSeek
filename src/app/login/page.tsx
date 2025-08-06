"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RippleWaveLoader } from '@/components/ripple-wave-loader';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isPolicyAgreed, setIsPolicyAgreed] = useState(false);

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
        <div className="flex h-full w-full flex-col items-center justify-center text-center bg-background">
            <RippleWaveLoader />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center p-8 text-center h-full">
        <div className="flex flex-col items-center gap-4">
            <Logo className="h-16 w-16 text-primary" />
            <h1 className="text-5xl font-bold tracking-tighter text-foreground font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                Welcome to TubeSeek
            </h1>
            <p className="max-w-md text-muted-foreground">
              No ads, no shorts, no distractions. Your focused portal to YouTube. Sign in to begin.
            </p>

             <div className="flex items-center space-x-2 mt-6">
                <Checkbox 
                    id="privacy-policy" 
                    onCheckedChange={(checked) => setIsPolicyAgreed(checked === true)}
                    checked={isPolicyAgreed}
                />
                <Label 
                    htmlFor="privacy-policy" 
                    className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                    I have read and agree to the{' '}
                    <Link href="/privacy-policy" target="_blank" className="underline hover:text-primary transition-colors">
                        Privacy Policy
                    </Link>
                    .
                </Label>
            </div>

            <Button onClick={handleSignIn} size="lg" className="mt-4" disabled={!isPolicyAgreed}>
                 <Image 
                    src="https://res.cloudinary.com/diwu3avy6/image/upload/icons8-google-50_hhk5el?_a=DATAdtAAZAA0" 
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
