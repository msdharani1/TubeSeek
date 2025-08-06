"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { RippleWaveLoader } from '@/components/ripple-wave-loader';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  guestId: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, guestId: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        let currentGuestId = localStorage.getItem('guestId');
        if (!currentGuestId) {
            currentGuestId = `guest-${uuidv4()}`;
            localStorage.setItem('guestId', currentGuestId);
        }
        setGuestId(currentGuestId);
      } else {
        localStorage.removeItem('guestId');
        setGuestId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, guestId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return function WithAuth(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const protectedRoutes = [
        '/admin',
    ];

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    useEffect(() => {
      if (!loading && !user && isProtectedRoute) {
        router.replace('/login');
      }
    }, [user, loading, router, isProtectedRoute, pathname]);

    if (loading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
                <RippleWaveLoader />
                <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
        );
    }
    
    if (isProtectedRoute && !user) {
         return (
            <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
                <RippleWaveLoader />
                <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
            </div>
        );
    }

    return <Component {...props} />;
  };
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
