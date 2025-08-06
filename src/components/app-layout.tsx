
"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./sidebar";
import { useAuth } from "@/context/auth-context";
import { Header } from "./header";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { logUserClick } from "@/app/actions/clicks";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    
    const showNav = pathname !== '/login' && pathname !== '/privacy-policy';

    useEffect(() => {
        if (user && pathname) {
            // We don't wait for the result, just fire and forget
            logUserClick(user.uid, pathname);
        }
    }, [user, pathname]);

    if (loading) {
       return (
         <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
       )
    }

    if (showNav) {
        return (
            <div className="flex h-screen w-full flex-col">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    <AppSidebar />
                    <main className="flex-1 overflow-y-auto bg-background">
                        {children}
                    </main>
                </div>
            </div>
        )
    }

    return <>{children}</>;
}
