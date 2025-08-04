
"use client";

import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { SidebarTrigger } from "./ui/sidebar";

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleLogoClick = () => {
    router.push('/search');
  }

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams();
    if (newQuery) {
      params.set('q', newQuery);
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Left Section */}
        <div className="flex items-center gap-2">
            <SidebarTrigger />
            <button onClick={handleLogoClick} aria-label="Go to homepage" className="flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold tracking-tight text-foreground font-headline hidden sm:inline-block">
                    TubeSeek
                </span>
            </button>
        </div>
        
        {/* Center Section */}
        <div className="flex flex-1 justify-center px-4">
          <div className="w-full max-w-2xl">
            <SearchBar onSearch={handleSearch} isLoading={false} initialQuery={query || ''} />
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden sm:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-muted/50">
                <div className="p-0.5 rounded-full bg-gradient-to-r from-primary via-accent to-primary">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                      <AvatarFallback>
                        <UserIcon/>
                      </AvatarFallback>
                    </Avatar>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
