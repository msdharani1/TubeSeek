
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { withAuth, useAuth } from "@/context/auth-context";
import { getPlaylists } from "@/app/actions/playlist";
import type { Playlist } from "@/types/youtube";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ListVideo, Frown, Loader2 } from "lucide-react";
import { PlaylistCard } from "@/components/playlist-card";
import { useToast } from "@/hooks/use-toast";

function PlaylistsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchPlaylists();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchPlaylists = async () => {
        if (!user) return;
        setIsLoading(true);
        const { data, error } = await getPlaylists(user.uid);
        if (error) {
            toast({
                variant: "destructive",
                title: "Failed to load playlists",
                description: error,
            });
        } else {
            setPlaylists(data || []);
        }
        setIsLoading(false);
    };

    const handlePlaylistClick = (playlistId: string) => {
        router.push(`/playlists/${playlistId}`);
    };

    return (
        <>
            <Header />
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
                ) : playlists.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {playlists.map(playlist => (
                            <PlaylistCard key={playlist.id} playlist={playlist} onClick={handlePlaylistClick} />
                        ))}
                    </div>
                ) : (
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
