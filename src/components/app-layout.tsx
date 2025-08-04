
"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./sidebar";
import { useAuth } from "@/context/auth-context";
import { Header } from "./header";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    
    const showNav = user && pathname !== '/login' && pathname !== '/privacy-policy';

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
            <SidebarProvider>
                <div className="flex h-screen w-full flex-col">
                    <Header />
                    <div className="flex flex-1 overflow-hidden">
                        <AppSidebar />
                        <main className="flex-1 overflow-y-auto bg-background p-4">
                            {children}
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        )
    }

    return <>{children}</>;
}
