
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
  Music,
  Flame,
  Newspaper,
  LogIn,
  Baby,
  KeyRound,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { auth } from "@/lib/firebase";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, guestId } = useAuth();
  const { setOpenMobile } = useSidebar();
  const isAdmin = user?.email === "msdharaniofficial@gmail.com";
  const inAdminSection = pathname.startsWith("/admin");
  const isGuest = !user;

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpenMobile(false);
  };
  
  const handleSignIn = () => {
    router.push('/login');
    setOpenMobile(false);
  }

  const navItem = (path: string, icon: React.ReactNode, text: string, disabled: boolean = false) => {
    let isActive = pathname.startsWith(path);
    if (path === '/search') {
      isActive = (pathname === '/search' || pathname === '/');
    }
     if (path === '/admin') {
      isActive = pathname === '/admin' && !pathname.startsWith('/admin/');
    }


    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => handleNavigation(path)}
          className="w-full justify-start"
          isActive={isActive}
          disabled={disabled}
          aria-disabled={disabled}
        >
          {icon}
          <span>{text}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const categoryNavItem = (path: string, icon: React.ReactNode, text: string) => {
     const isActive = pathname === path;
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
  }

  return (
    <Sidebar>
      <div className="p-4 border-b md:hidden">
        <Link
          href="/search"
          className="flex items-center gap-2"
          onClick={() => setOpenMobile(false)}
        >
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
              {navItem("/admin/feedback", <MessageSquare />, "Feedback")}
              {navItem("/admin/api-limit", <KeyRound />, "API Limit")}
            </>
          ) : (
            <>
              {navItem("/search", <Home />, "Home")}
              {categoryNavItem("/trending", <Flame />, "Trending")}
              {categoryNavItem("/music", <Music />, "Music")}
              {categoryNavItem("/news", <Newspaper />, "News")}
              {categoryNavItem("/kids", <Baby />, "Kids")}
              {navItem("/playlists", <ListVideo />, "Playlists")}
              {navItem("/history", <History />, "History")}
              {navItem("/liked", <Heart />, "Liked Videos")}
              {navItem("/subscriptions", <Tv />, "Subscriptions")}
              {navItem("/settings", <Settings />, "Settings")}
              {isAdmin && navItem("/admin", <Shield />, "Admin")}
            </>
          )}
        </SidebarMenu>
        
        <SidebarFooter className="mt-auto p-4 space-y-4 text-muted-foreground md:mb-16">
            {isGuest && (
                <div className="md:hidden">
                    <Button onClick={handleSignIn} className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                    </Button>
                </div>
            )}
          <div className="flex flex-col items-center gap-4">
              <div className="flex space-x-2 justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-sidebar-accent hover:text-foreground"
                  asChild
                >
                  <Link href="http://github.com/msdharani1/" target="_blank">
                    <Github className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-sidebar-accent hover:text-foreground"
                  asChild
                >
                  <Link
                    href="https://www.linkedin.com/in/tharanimca/"
                    target="_blank"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-sidebar-accent hover:text-foreground"
                  asChild
                >
                  <Link href="https://x.com/msdharani007" target="_blank">
                    <Twitter className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 text-center group-data-[collapsible=icon]:hidden">
                <p>
                  Developed by{" "}
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
                  <Link
                    href="/privacy-policy"
                    onClick={() => setOpenMobile(false)}
                    className="hover:text-primary underline"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
