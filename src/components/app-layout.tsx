
"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./sidebar";
import { useAuth } from "@/context/auth-context";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();
    
    const showSidebar = user && pathname !== '/login' && pathname !== '/privacy-policy';

    if (showSidebar) {
        return (
            <SidebarProvider>
                <div className="flex w-full">
                    <AppSidebar />
                    <main className="flex-1 min-w-0">{children}</main>
                </div>
            </SidebarProvider>
        )
    }

    return <>{children}</>;
}
