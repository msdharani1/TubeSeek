"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  History,
  Settings,
  Heart,
  Tv,
  ListVideo,
  Shield,
  Github,
  Linkedin,
  Twitter,
  Home,
  LayoutDashboard,
  Users,
  Lightbulb,
  LineChart,
  MousePointerClick,
  Users2,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import { Logo } from "./logo";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();
  const isAdmin = user?.email === "msdharaniofficial@gmail.com";
  const inAdminSection = pathname.startsWith("/admin");

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpenMobile(false);
  };

  const navItem = (path: string, icon: React.ReactNode, text: string) => {
    const isActive = path === '/admin' 
        ? pathname === path
        : (path === '/search' || path === '/' 
            ? pathname === path 
            : pathname.startsWith(path));
    
    return (
        <SidebarMenuItem>
        <SidebarMenuButton
            onClick={() => handleNavigation(path)}
            className="w-full justify-start"
            isActive={isActive}
        >
            {icon}
            <span>{text}</span>
        </SidebarMenuButton>
        </SidebarMenuItem>
    )
  };

  return (
    <Sidebar>
      <div className="p-4 border-b md:hidden">
        <Link href="/search" className="flex items-center gap-2" onClick={() => setOpenMobile(false)}>
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground font-headline">
                TubeSeek
            </span>
        </Link>
      </div>
      <SidebarContent className="flex flex-col lg:h-[calc(100vh-theme(spacing.16))]">
        <SidebarMenu className="p-4">
           {isAdmin && inAdminSection ? (
            <>
              {navItem("/search", <Home />, "Home")}
              {navItem("/admin", <LayoutDashboard />, "Dashboard")}
              {navItem("/admin/history", <History />, "User History")}
              {navItem("/admin/users", <Users2 />, "Users")}
              {navItem("/admin/suggestions", <Lightbulb />, "Suggestions")}
              {navItem("/admin/track", <LineChart />, "Track")}
              {navItem("/admin/clicks", <MousePointerClick />, "Clicks")}
            </>
          ) : (
            <>
              {navItem("/search", <Home />, "Home")}
              {navItem("/playlists", <ListVideo />, "Playlists")}
              {navItem("/history", <History />, "History")}
              {navItem("/liked", <Heart />, "Liked Videos")}
              {navItem("/subscriptions", <Tv />, "Subscriptions")}
              {navItem("/settings", <Settings />, "Settings")}
              {isAdmin && navItem("/admin", <Shield />, "Admin")}
            </>
          )}
        </SidebarMenu>
        <SidebarFooter className="p-4 space-y-4 mt-auto text-muted-foreground md:mb-16">
            <div className="flex space-x-2 justify-center group-data-[collapsible=icon]:justify-start">
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-sidebar-accent hover:text-foreground" asChild>
                    <Link href="http://github.com/msdharani1/" target="_blank">
                        <Github className="h-4 w-4" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-sidebar-accent hover:text-foreground" asChild>
                    <Link href="https://www.linkedin.com/in/tharanimca/" target="_blank">
                        <Linkedin className="h-4 w-4" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-sidebar-accent hover:text-foreground" asChild>
                    <Link href="https://x.com/msdharani007" target="_blank">
                        <Twitter className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 text-center group-data-[collapsible=icon]:hidden">
                <p>
                    Developed by{' '}
                    <a 
                    href="http://www.dev.msdharani.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-bold text-primary hover:underline"
                    >
                    MS Dharani
                    </a>
                    .
                </p>
                <p>
                    <Link href="/privacy-policy" onClick={() => setOpenMobile(false)} className="hover:text-primary underline">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
