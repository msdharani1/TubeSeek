
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
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
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
        isActive={pathname.startsWith(path)}
      >
        {icon}
        <span>{text}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar>
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
        <div className="flex space-x-2 justify-center group-data-[collapsible=icon]:justify-start">
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
        <div className="text-xs text-muted-foreground space-y-1 text-center group-data-[collapsible=icon]:text-left group-data-[collapsible=icon]:hidden">
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
    </Sidebar>
  );
}
