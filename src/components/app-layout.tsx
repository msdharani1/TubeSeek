
"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./sidebar";
import { useAuth } from "@/context/auth-context";
import { Header } from "./header";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SearchPageContent } from "@/app/search/page";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    
    const showSidebar = user && pathname !== '/login' && pathname !== '/privacy-policy';

    if (loading) {
       return (
         <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
       )
    }

    if (showSidebar) {
        return (
            <SidebarProvider>
                <div className="flex w-full">
                    <AppSidebar />
                    <main className="flex-1 min-w-0">
                        <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Loading...</p></div>}>
                            <SearchPageContent />
                        </Suspense>
                    </main>
                </div>
            </SidebarProvider>
        )
    }

    return <>{children}</>;
}
