
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { withAuth, useAuth } from "@/context/auth-context";
import { getPlaylists } from "@/app/actions/playlist";
import type { Playlist } from "@/types/youtube";

import { Button } from "@/components/ui/button";
import { ListVideo, Frown, LogIn } from "lucide-react";
import { PlaylistCard } from "@/components/playlist-card";
import { useToast } from "@/hooks/use-toast";

const defaultFavoritePlaylist: Playlist = {
    id: 'favorite-default',
    name: 'Favorite',
    videoCount: 0,
    createdAt: Date.now(),
};

type CachedPlaylists = {
    timestamp: number;
    playlists: Playlist[];
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function PlaylistsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchPlaylists();
        } else {
            setIsLoading(false);
            setPlaylists([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchPlaylists = async () => {
        if (!user) return;
        setIsLoading(true);

        const cacheKey = `playlists_cache_${user.uid}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            try {
                const { timestamp, playlists: cachedPlaylists }: CachedPlaylists = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    processPlaylists(cachedPlaylists);
                    setIsLoading(false);
                    return;
                }
            } catch(e) {
                console.error("Failed to parse playlists cache", e);
                localStorage.removeItem(cacheKey);
            }
        }

        const { data, error } = await getPlaylists(user.uid);
        if (error) {
            toast({
                variant: "destructive",
                title: "Failed to load playlists",
                description: error,
            });
            setPlaylists([defaultFavoritePlaylist]);
        } else {
            const fetchedPlaylists = data || [];
            processPlaylists(fetchedPlaylists);
            const dataToCache: CachedPlaylists = {
                timestamp: Date.now(),
                playlists: fetchedPlaylists
            };
            localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        }
        setIsLoading(false);
    };

    const processPlaylists = (fetchedPlaylists: Playlist[]) => {
        const hasFavorite = fetchedPlaylists.some(p => p.name === 'Favorite');
        if (!hasFavorite) {
            setPlaylists([defaultFavoritePlaylist, ...fetchedPlaylists]);
        } else {
            setPlaylists(fetchedPlaylists);
        }
    }

    const handlePlaylistClick = (playlistId: string) => {
        router.push(`/playlists/${playlistId}`);
    };

    const displayedPlaylists = playlists.sort((a, b) => {
        if (a.name === 'Favorite') return -1;
        if (b.name === 'Favorite') return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
    });

    if (!user && !isLoading) {
       return (
         <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center gap-4 mt-20">
            <ListVideo className="w-16 h-16 text-muted-foreground"/>
            <h2 className="text-2xl font-semibold">Your Custom Playlists</h2>
            <p className="max-w-md text-muted-foreground">Sign in to create and manage playlists. Organize videos your way.</p>
            <Button onClick={() => router.push('/login')}>
                <LogIn className="mr-2 h-4 w-4"/>
                Sign In
            </Button>
        </div>
       )
    }

    return (
        <>
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <ListVideo className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">My Playlists</h1>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                           <PlaylistCard key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displayedPlaylists.map(playlist => (
                            <PlaylistCard key={playlist.id} playlist={playlist} onClick={handlePlaylistClick} />
                        ))}
                    </div>
                )}
                 {/* This case might not be reached now, but kept for safety. */}
                 {!isLoading && displayedPlaylists.length === 0 && (
                    <div className="text-center text-muted-foreground flex flex-col items-center gap-4 mt-20">
                        <Frown className="w-16 h-16"/>
                        <h2 className="text-2xl font-semibold">No Playlists Yet</h2>
                        <p>Create your first playlist by adding a video.</p>
                        <Button onClick={() => router.push('/search')}>Find Videos</Button>
                    </div>
                 )}
            </main>
        </>
    );
}

export default withAuth(PlaylistsPage);
