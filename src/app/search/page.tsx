
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import type { SearchResult } from "@/types/youtube";
import { searchAndRefineVideos, saveSearchQuery } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { withAuth, useAuth } from '@/context/auth-context';

import { Logo } from "@/components/logo";
import { SearchBar } from "@/components/search-bar";
import { VideoGrid } from "@/components/video-grid";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { VideoPlayer } from "@/components/video-player";
import { Frown, Loader2 } from "lucide-react";
import { Header } from "@/components/header";

function SearchPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Loading...</p></div>}>
            <SearchPageContent />
        </Suspense>
    )
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);
  
  const query = searchParams.get('q');
  const videoId = searchParams.get('v');

  const hasSearched = query !== null;

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setResults([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (videoId && results.length > 0) {
      const videoToPlay = results.find(v => v.videoId === videoId);
      setSelectedVideo(videoToPlay || null);
    } else {
      setSelectedVideo(null);
    }
  }, [videoId, results]);

  useEffect(() => {
    if (selectedVideo) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [selectedVideo]);


  const performSearch = async (searchQuery: string) => {
    if (!searchQuery) return;

    setIsLoading(true);
    setResults([]);

    try {
      const response = await searchAndRefineVideos(searchQuery);
      if (response.error) {
        throw new Error(response.error);
      }
      const searchResults = response.data || [];
      setResults(searchResults);
      
      if (user) {
        const userInfo = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };

        // Don't await this, let it run in the background
        saveSearchQuery(userInfo, searchQuery, searchResults.length)
          .then(saveResult => {
            if (saveResult.error) {
                console.warn("Failed to save search history:", saveResult.error);
                // Not showing a toast for this as it's not critical for the user experience
            }
          });
      }

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
  };

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams();
    if (newQuery) {
      params.set('q', newQuery);
      router.push(`/search?${params.toString()}`);
    } else {
        router.push('/search');
    }
  };

  const handleSelectVideo = (videoToPlay: SearchResult) => {
    const params = new URLSearchParams(window.location.search);
    params.set('v', videoToPlay.videoId);
    router.push(`/search?${params.toString()}`);
  };
  
  const handleClosePlayer = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('v');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div
          className={cn(
            "w-full transition-all duration-500 ease-in-out",
            hasSearched
              ? "mb-8 text-center"
              : "flex h-[calc(60vh-80px)] flex-col items-center justify-center text-center"
          )}
        >
          <div className="flex items-center gap-4">
             <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-foreground font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                TubeSeek
             </h1>
          </div>
          <p className={cn("mt-4 max-w-xl text-muted-foreground", hasSearched && "text-center mx-auto")}>
            Your intelligent portal to YouTube. Enter a query to discover refined video results.
          </p>
          <div className={cn("mt-8 w-full max-w-2xl", hasSearched && "mx-auto")}>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} initialQuery={query || ''} />
          </div>
        </div>

        {isLoading && <LoadingSkeleton />}

        {!isLoading && hasSearched && results.length > 0 && (
          <VideoGrid videos={results} onPlayVideo={handleSelectVideo} />
        )}
        
        {!isLoading && hasSearched && results.length === 0 && (
            <div className="text-center text-muted-foreground flex flex-col items-center gap-4">
                <Frown className="w-16 h-16"/>
                <h2 className="text-2xl font-semibold">No Results Found</h2>
                <p>We couldn't find any relevant videos for your search. Please try a different query.</p>
            </div>
        )}

      </main>
      <VideoPlayer
        video={selectedVideo}
        suggestions={results.filter(r => r.videoId !== selectedVideo?.videoId)}
        onPlaySuggestion={handleSelectVideo}
        onClose={handleClosePlayer}
      />
    </>
  );
}


export default withAuth(SearchPage);
