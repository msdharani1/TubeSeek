
"use client";

import { useState, useEffect } from "react";
import type { SearchResult, LikedVideo } from "@/types/youtube";
import { getLikedVideos } from "@/app/actions/video-interactions";
import { withAuth, useAuth } from '@/context/auth-context';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from 'next/navigation';

import { LoadingSkeleton } from "@/components/loading-skeleton";
import { VideoPlayer } from "@/components/video-player";
import { VideoCard } from "@/components/video-card";
import { Heart, Frown, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liked Videos',
  description: 'Find all the videos you have liked on TubeSeek. Your personal collection of favorite content, all in one place.',
  keywords: ['liked videos', 'favorite videos', 'saved videos'],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Liked Videos | TubeSeek',
    description: 'Revisit all the videos you\'ve liked on TubeSeek.',
  },
};


type CachedLikedVideos = {
    timestamp: number;
    videos: LikedVideo[];
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function LikedVideosPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);

    const videoId = searchParams.get('v');

    usePageTitle(selectedVideo ? selectedVideo.title : 'Liked Videos');

    useEffect(() => {
        if (user) {
            fetchLikedVideos();
        } else {
            setIsLoading(false);
            setLikedVideos([]);
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

        const cacheKey = `liked_videos_cache_${user.uid}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
             try {
                const { timestamp, videos: cachedVideos }: CachedLikedVideos = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setLikedVideos(cachedVideos);
                    setIsLoading(false);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse liked videos cache", e);
                localStorage.removeItem(cacheKey);
            }
        }
        
        const { data, error } = await getLikedVideos(user.uid);
        if (error) {
            toast({
                variant: "destructive",
                title: "Failed to load liked videos",
                description: error,
            });
        } else if (data) {
            setLikedVideos(data);
             const dataToCache: CachedLikedVideos = {
                timestamp: Date.now(),
                videos: data
            };
            localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        }
        setIsLoading(false);
    };

    const handleSelectVideo = (videoToPlay: SearchResult) => {
        const params = new URLSearchParams(window.location.search);
        params.set('v', videoToPlay.videoId);
        router.push(`/liked?${params.toString()}`);
    };
    
    const handleClosePlayer = () => {
        setSelectedVideo(null);
        const params = new URLSearchParams(window.location.search);
        params.delete('v');
        router.push(`/liked?${params.toString()}`);
    };

    if (!user && !isLoading) {
       return (
         <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center gap-4 mt-20">
            <Heart className="w-16 h-16 text-muted-foreground"/>
            <h2 className="text-2xl font-semibold">Your Liked Videos</h2>
            <p className="max-w-md text-muted-foreground">Sign in to save videos you like. They'll all show up here.</p>
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
                    <div className="text-center text-muted-foreground flex flex-col items-center gap-4 mt-20 px-4 sm:px-0">
                        <Frown className="w-16 h-16"/>
                        <h2 className="text-2xl font-semibold">No Liked Videos Yet</h2>
                        <p>Videos you like will appear here.</p>
                        <Button onClick={() => router.push('/search')}>Start Searching</Button>
                    </div>
                )}
            </main>
            {selectedVideo && <VideoPlayer
                video={selectedVideo}
                source="liked"
                suggestions={likedVideos.filter(r => r.videoId !== selectedVideo?.videoId)}
                onPlaySuggestion={handleSelectVideo}
                onClose={handleClosePlayer}
            />}
        </>
    );
}

export default withAuth(LikedVideosPage);
