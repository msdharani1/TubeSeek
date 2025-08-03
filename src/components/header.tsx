
"use client";

import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { LogOut, User as UserIcon, Shield, History, Settings, Heart, Tv } from "lucide-react";
import { Logo } from "./logo";
import { ListVideo } from "./icons";
import { SearchBar } from "./search-bar";
import type { SearchBarProps } from "./search-bar";

type HeaderProps = Partial<SearchBarProps>;

export function Header({ onSearch, isLoading, initialQuery }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();

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

  const handleManageClick = () => {
    router.push('/admin');
  }

  const handleHistoryClick = () => {
    router.push('/history');
  }

  const handlePlaylistsClick = () => {
    router.push('/playlists');
  }
  
  const handleLikedVideosClick = () => {
    router.push('/liked');
  }
  
  const handleSubscriptionsClick = () => {
      router.push('/subscriptions');
  }

  const handleSettingsClick = () => {
    router.push('/settings');
  }
  
  const isAdmin = user?.email === "msdharaniofficial@gmail.com";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
            <button onClick={handleLogoClick} aria-label="Go to homepage" className="flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold tracking-tight text-foreground font-headline hidden sm:inline-block">
                    TubeSeek
                </span>
            </button>
        </div>
        
        {user && onSearch && (
            <div className="flex-1 max-w-2xl">
                <SearchBar onSearch={onSearch} isLoading={isLoading || false} initialQuery={initialQuery || ''} />
            </div>
        )}

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-muted/50">
                <div className="p-0.5 rounded-full bg-gradient-to-r from-primary via-accent to-primary">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
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
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handlePlaylistsClick} className="cursor-pointer">
                  <ListVideo className="mr-2 h-4 w-4" />
                  <span>Playlists</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleHistoryClick} className="cursor-pointer">
                  <History className="mr-2 h-4 w-4" />
                  <span>History</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLikedVideosClick} className="cursor-pointer">
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Liked Videos</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSubscriptionsClick} className="cursor-pointer">
                  <Tv className="mr-2 h-4 w-4" />
                  <span>Subscriptions</span>
              </DropdownMenuItem>
               <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={handleManageClick} className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Manage</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
