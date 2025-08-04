
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
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
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Logo } from "./logo";
import { Button } from "./ui/button";

export function AppSidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();
  const isAdmin = user?.email === "msdharaniofficial@gmail.com";

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpenMobile(false);
  };

  const navItem = (path: string, icon: React.ReactNode, text: string) => (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => handleNavigation(path)}
        className="w-full justify-start"
      >
        {icon}
        <span>{text}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Logo className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold">TubeSeek</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {navItem("/playlists", <ListVideo />, "Playlists")}
          {navItem("/history", <History />, "History")}
          {navItem("/liked", <Heart />, "Liked Videos")}
          {navItem("/subscriptions", <Tv />, "Subscriptions")}
          {navItem("/settings", <Settings />, "Settings")}
          {isAdmin && navItem("/admin", <Shield />, "Manage")}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-4">
        <div className="text-xs text-muted-foreground space-y-1">
             <p>Developed by <strong>MS Dharani</strong></p>
            <p>
                <Link href="/privacy-policy" onClick={() => setOpenMobile(false)} className="hover:text-primary underline">
                    Privacy Policy
                </Link>
            </p>
        </div>
        <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <Link href="http://github.com/msdharani1/" target="_blank">
                    <Github className="h-4 w-4" />
                </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                 <Link href="https://www.linkedin.com/in/tharanimca/" target="_blank">
                    <Linkedin className="h-4 w-4" />
                </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <Link href="https://x.com/msdharani007" target="_blank">
                    <Twitter className="h-4 w-4" />
                </Link>
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
