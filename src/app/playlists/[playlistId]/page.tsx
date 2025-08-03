
"use client";

import { useState, useEffect } from "react";
import type { PlaylistItem, SearchResult } from "@/types/youtube";
import { getPlaylistVideos } from "@/app/actions/playlist";
import { withAuth, useAuth } from '@/context/auth-context';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams, useParams } from 'next/navigation';

import { Header } from "@/components/header";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { VideoPlayer } from "@/components/video-player";
import { VideoCard } from "@/components/video-card";
import { ListVideo, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

function PlaylistDetailPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();

    const playlistId = params.playlistId as string;
    
    const [videos, setVideos] = useState<PlaylistItem[]>([]);
    const [playlistName, setPlaylistName] = useState("Playlist");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);

    const videoId = searchParams.get('v');

    useEffect(() => {
        if (user && playlistId) {
            fetchVideos();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, playlistId]);

    useEffect(() => {
        if (videoId && videos.length > 0) {
            const videoToPlay = videos.find(v => v.videoId === videoId);
            setSelectedVideo(videoToPlay || null);
        } else {
            setSelectedVideo(null);
        }
    }, [videoId, videos]);

    const fetchVideos = async () => {
        setIsLoading(true);
        if (!user) return;
        
        const { data, error, playlistName } = await getPlaylistVideos(user.uid, playlistId);
        if (error) {
            toast({
                variant: "destructive",
                title: "Failed to load playlist",
                description: error,
            });
        } else {
            setVideos(data || []);
            setPlaylistName(playlistName || "Playlist");
        }
        setIsLoading(false);
    };

    const handleSelectVideo = (videoToPlay: SearchResult) => {
        const params = new URLSearchParams(window.location.search);
        params.set('v', videoToPlay.videoId);
        router.push(`/playlists/${playlistId}?${params.toString()}`);
    };
    
    const handleClosePlayer = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete('v');
        router.push(`/playlists/${playlistId}?${params.toString()}`);
    };

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <ListVideo className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">{playlistName}</h1>
                    </div>
                </div>
                
                {isLoading ? (
                    <LoadingSkeleton />
                ) : videos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {videos.map(video => (
                            <VideoCard key={video.id} id={video.id} video={video} onPlay={handleSelectVideo} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground flex flex-col items-center gap-4 mt-20">
                        <Frown className="w-16 h-16"/>
                        <h2 className="text-2xl font-semibold">Playlist is Empty</h2>
                        <p>Add some videos to this playlist to see them here.</p>
                        <Button onClick={() => router.push('/search')}>Find Videos</Button>
                    </div>
                )}
            </main>
            <VideoPlayer
                video={selectedVideo}
                source="playlist"
                playlistName={playlistName}
                suggestions={videos.filter(r => r.videoId !== selectedVideo?.videoId)}
                onPlaySuggestion={handleSelectVideo}
                onClose={handleClosePlayer}
            />
        </>
    );
}

export default withAuth(PlaylistDetailPage);
