
"use client";

import { useState, useEffect } from "react";
import type { SearchResult, WatchedVideo } from "@/types/youtube";
import { withAuth, useAuth } from '@/context/auth-context';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from 'next/navigation';

import { LoadingSkeleton } from "@/components/loading-skeleton";
import { VideoPlayer } from "@/components/video-player";
import { VideoCard } from "@/components/video-card";
import { History, Frown, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";

function HistoryPageComponent() {
    const { user, history, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);

    const videoId = searchParams.get('v');
    
    usePageTitle(selectedVideo ? selectedVideo.title : 'Watch History');

    useEffect(() => {
        if (!authLoading) {
            setIsLoading(false);
        }
    }, [authLoading]);

    useEffect(() => {
        if (videoId && history.length > 0) {
            const videoToPlay = history.find(v => v.videoId === videoId);
            setSelectedVideo(videoToPlay || null);
        } else {
            setSelectedVideo(null);
        }
    }, [videoId, history]);


    const handleSelectVideo = (videoToPlay: SearchResult) => {
        const params = new URLSearchParams(window.location.search);
        params.set('v', videoToPlay.videoId);
        router.push(`/history?${params.toString()}`);
    };
    
    const handleClosePlayer = () => {
        setSelectedVideo(null);
        const params = new URLSearchParams(window.location.search);
        params.delete('v');
        router.push(`/history?${params.toString()}`);
    };

    if (!user && !isLoading) {
       return (
         <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center gap-4 mt-20">
            <History className="w-16 h-16 text-muted-foreground"/>
            <h2 className="text-2xl font-semibold">Your Watch History</h2>
            <p className="max-w-md text-muted-foreground">Sign in to keep track of what you watch. Your history will appear here.</p>
            <Button onClick={() => router.push('/login')}>
                <LogIn className="mr-2 h-4 w-4"/>
                Sign In
            </Button>
        </div>
       )
    }

    return (
        <>
            <main className="container mx-auto sm:px-4 py-8">
                <div className="flex items-center justify-between mb-8 px-4 sm:px-0">
                    <div className="flex items-center gap-3">
                        <History className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">Watch History</h1>
                    </div>
                </div>
                
                {isLoading ? (
                    <LoadingSkeleton />
                ) : history.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {history.map(video => (
                            <VideoCard key={video.id} id={video.id} video={video} onPlay={handleSelectVideo} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground flex flex-col items-center gap-4 mt-20 px-4 sm:px-0">
                        <Frown className="w-16 h-16"/>
                        <h2 className="text-2xl font-semibold">No History Yet</h2>
                        <p>Videos you watch will appear here.</p>
                        <Button onClick={() => router.push('/search')}>Start Searching</Button>
                    </div>
                )}
            </main>
            {selectedVideo && <VideoPlayer
                video={selectedVideo}
                source="history"
                suggestions={history.filter(r => r.videoId !== selectedVideo?.videoId)}
                onPlaySuggestion={handleSelectVideo}
                onClose={handleClosePlayer}
            />}
        </>
    );
}

export const HistoryClient = withAuth(HistoryPageComponent);
