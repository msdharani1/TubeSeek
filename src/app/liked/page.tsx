
"use client";

import { useState, useEffect } from "react";
import type { SearchResult, LikedVideo } from "@/types/youtube";
import { getLikedVideos } from "@/app/actions/video-interactions";
import { withAuth, useAuth } from '@/context/auth-context';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from 'next/navigation';

import { Header } from "@/components/header";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { VideoPlayer } from "@/components/video-player";
import { VideoCard } from "@/components/video-card";
import { Heart, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

function LikedVideosPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);

    const videoId = searchParams.get('v');

    useEffect(() => {
        if (user) {
            fetchLikedVideos();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        if (videoId && likedVideos.length > 0) {
            const videoToPlay = likedVideos.find(v => v.videoId === videoId);
            setSelectedVideo(videoToPlay || null);
        } else {
            setSelectedVideo(null);
        }
    }, [videoId, likedVideos]);

    const fetchLikedVideos = async () => {
        setIsLoading(true);
        if (!user) return;
        
        const { data, error } = await getLikedVideos(user.uid);
        if (error) {
            toast({
                variant: "destructive",
                title: "Failed to load liked videos",
                description: error,
            });
        } else {
            setLikedVideos(data || []);
        }
        setIsLoading(false);
    };

    const handleSelectVideo = (videoToPlay: SearchResult) => {
        const params = new URLSearchParams(window.location.search);
        params.set('v', videoToPlay.videoId);
        router.push(`/liked?${params.toString()}`);
    };
    
    const handleClosePlayer = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete('v');
        router.push(`/liked?${params.toString()}`);
    };

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Heart className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">Liked Videos</h1>
                    </div>
                </div>
                
                {isLoading ? (
                    <LoadingSkeleton />
                ) : likedVideos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {likedVideos.map(video => (
                            <VideoCard key={video.videoId} id={video.videoId} video={video} onPlay={handleSelectVideo} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground flex flex-col items-center gap-4 mt-20">
                        <Frown className="w-16 h-16"/>
                        <h2 className="text-2xl font-semibold">No Liked Videos Yet</h2>
                        <p>Videos you like will appear here.</p>
                        <Button onClick={() => router.push('/search')}>Start Searching</Button>
                    </div>
                )}
            </main>
            <VideoPlayer
                video={selectedVideo}
                source="history"
                suggestions={likedVideos.filter(r => r.videoId !== selectedVideo?.videoId)}
                onPlaySuggestion={handleSelectVideo}
                onClose={handleClosePlayer}
            />
        </>
    );
}

export default withAuth(LikedVideosPage);
