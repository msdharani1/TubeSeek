
"use client";

import { useState, useEffect } from "react";
import type { SearchResult, WatchedVideo } from "@/types/youtube";
import { getUserHistory } from "@/app/actions";
import { withAuth, useAuth } from '@/context/auth-context';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from 'next/navigation';

import { Header } from "@/components/header";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { VideoPlayer } from "@/components/video-player";
import { VideoCard } from "@/components/video-card";
import { History, Frown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function HistoryPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [history, setHistory] = useState<WatchedVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);

    const videoId = searchParams.get('v');

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        if (videoId && history.length > 0) {
            const videoToPlay = history.find(v => v.videoId === videoId);
            setSelectedVideo(videoToPlay || null);
        } else {
            setSelectedVideo(null);
        }
    }, [videoId, history]);

    const fetchHistory = async () => {
        setIsLoading(true);
        if (!user) return;
        
        const { data, error } = await getUserHistory(user.uid);
        if (error) {
            toast({
                variant: "destructive",
                title: "Failed to load history",
                description: error,
            });
        } else {
            setHistory(data || []);
        }
        setIsLoading(false);
    };

    const handleSelectVideo = (videoToPlay: SearchResult) => {
        const params = new URLSearchParams(window.location.search);
        params.set('v', videoToPlay.videoId);
        router.push(`/history?${params.toString()}`);
    };
    
    const handleClosePlayer = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete('v');
        router.push(`/history?${params.toString()}`);
    };

    const handleClearHistory = async () => {
        // This is a placeholder for a future implementation
        console.log("Clearing history...");
    }

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <History className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">Watch History</h1>
                    </div>
                    {/* <Button variant="outline" onClick={handleClearHistory} disabled={history.length === 0}>
                        Clear watch history
                    </Button> */}
                </div>
                
                {isLoading ? (
                    <LoadingSkeleton />
                ) : history.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {history.map(video => (
                            <VideoCard key={video.id} video={video} onPlay={handleSelectVideo} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground flex flex-col items-center gap-4 mt-20">
                        <Frown className="w-16 h-16"/>
                        <h2 className="text-2xl font-semibold">No History Yet</h2>
                        <p>Videos you watch will appear here.</p>
                        <Button onClick={() => router.push('/search')}>Start Searching</Button>
                    </div>
                )}
            </main>
            <VideoPlayer
                video={selectedVideo}
                source="history"
                suggestions={history.filter(r => r.videoId !== selectedVideo?.videoId)}
                onPlaySuggestion={handleSelectVideo}
                onClose={handleClosePlayer}
            />
        </>
    );
}

export default withAuth(HistoryPage);
