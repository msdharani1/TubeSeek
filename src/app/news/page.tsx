"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import type { SearchResult } from "@/types/youtube";
import { getCategoryVideos } from "@/app/actions/categories";
import { useToast } from "@/hooks/use-toast";
import { withAuth } from '@/context/auth-context';

import { LoadingSkeleton } from "@/components/loading-skeleton";
import { VideoPlayer } from "@/components/video-player";
import { Newspaper } from "lucide-react";
import { VideoGrid } from "@/components/video-grid";
import { usePageTitle } from "@/hooks/use-page-title";
import { RippleWaveLoader } from "@/components/ripple-wave-loader";

type CachedCategoryVideos = {
    timestamp: number;
    videos: SearchResult[];
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function NewsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);
    
    const videoId = searchParams.get('v');

    usePageTitle(selectedVideo ? selectedVideo.title : 'News');

    const performSearch = useCallback(async () => {
      setIsLoading(true);
      const cacheKey = `news_videos_cache`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
          try {
              const { timestamp, videos: cachedVideos }: CachedCategoryVideos = JSON.parse(cached);
              if (Date.now() - timestamp < CACHE_DURATION) {
                  setResults(cachedVideos);
                  setIsLoading(false);
                  return;
              }
          } catch (e) {
              console.error("Failed to parse news videos cache", e);
              localStorage.removeItem(cacheKey);
          }
      }

      try {
        const response = await getCategoryVideos("News");
        if (response.error) {
          throw new Error(response.error);
        }
        const freshVideos = response.data || [];
        setResults(freshVideos);
        const dataToCache: CachedCategoryVideos = {
            timestamp: Date.now(),
            videos: freshVideos
        };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
          variant: "destructive",
          title: "Search Failed",
          description: errorMessage,
        });
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, [toast]);

    useEffect(() => {
        performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    useEffect(() => {
      if (videoId && results.length > 0) {
        const videoToPlay = results.find(v => v.videoId === videoId);
        setSelectedVideo(videoToPlay || null);
      } else {
        setSelectedVideo(null);
      }
    }, [videoId, results]);

    const handleSelectVideo = (videoToPlay: SearchResult) => {
      const params = new URLSearchParams(window.location.search);
      params.set('v', videoToPlay.videoId);
      router.push(`/news?${params.toString()}`);
    };
    
    const handleClosePlayer = () => {
      const params = new URLSearchParams(window.location.search);
      params.delete('v');
      router.push(`/news?${params.toString()}`);
    };

    return (
      <div className="flex-1">
        <div className="container mx-auto sm:px-4 py-8">
            <div className="flex items-center gap-3 mb-8 px-4 sm:px-0">
                <Newspaper className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">News</h1>
            </div>
          
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <VideoGrid videos={results} onPlayVideo={handleSelectVideo} />
          )}

        </div>
        <VideoPlayer
          video={selectedVideo}
          suggestions={results.filter(r => r.videoId !== selectedVideo?.videoId)}
          onPlaySuggestion={handleSelectVideo}
          onClose={handleClosePlayer}
          source="search"
        />
      </div>
    );
}

function NewsPageWrapper() {
   return (
      <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background"><RippleWaveLoader /><p className="mt-4 text-muted-foreground">Loading...</p></div>}>
          <NewsPage />
      </Suspense>
   )
}

export default withAuth(NewsPageWrapper);
