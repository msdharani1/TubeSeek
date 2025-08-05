
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth, useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.email !== "msdharaniofficial@gmail.com")) {
      router.replace('/search');
    }
  }, [user, authLoading, router]);


  if (authLoading || !user || user.email !== "msdharaniofficial@gmail.com") {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>
       <div className="text-center text-muted-foreground py-12">
          <p>Welcome to the admin dashboard. Select an option from the sidebar to get started.</p>
       </div>
    </main>
  );
}

export default withAuth(AdminPage);
