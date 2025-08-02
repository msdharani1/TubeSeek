
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/search');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
       <div className="flex items-center gap-4">
         <Logo className="h-16 w-16 text-primary animate-pulse" />
         <h1 className="text-6xl font-bold tracking-tighter text-foreground font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            TubeSeek
         </h1>
      </div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
}
