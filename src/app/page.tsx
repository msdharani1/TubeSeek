
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/search');
  }, [router]);

  // Return a minimal loader to prevent flash of unstyled content while redirecting.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
}
