
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import type { SearchResult } from "@/types/youtube";
import { searchAndRefineVideos, saveSearchQuery, getSuggestedVideos } from "@/app/actions";
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

type CachedData = {
    timestamp: number;
    results: SearchResult[];
}

const SEARCH_CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour for regular search
const SUGGESTIONS_CACHE_EXPIRATION_MS = 1 * 60 * 1000; // 1 minute for suggestions

// Function to shuffle an array
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

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
  const [pageTitle, setPageTitle] = useState("TubeSeek");
  
  const query = searchParams.get('q');
  const videoId = searchParams.get('v');

  const hasSearched = query !== null;

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery) return;

    setIsLoading(true);
    setResults([]);
    setPageTitle(`Results for "${searchQuery}"`);

    // Check cache first
    const cacheKey = `youtube_search_${searchQuery.toLowerCase()}`;
    const cachedItem = localStorage.getItem(cacheKey);

    if (cachedItem) {
        try {
            const cachedData: CachedData = JSON.parse(cachedItem);
            if (Date.now() - cachedData.timestamp < SEARCH_CACHE_EXPIRATION_MS) {
                setResults(cachedData.results);
                setIsLoading(false);
                return; // Use cached data
            }
        } catch (e) {
            console.error("Failed to parse cache", e);
            localStorage.removeItem(cacheKey);
        }
    }
    
    // If no valid cache, fetch from API
    try {
      const response = await searchAndRefineVideos(searchQuery);
      if (response.error) {
        throw new Error(response.error);
      }
      const searchResults = response.data || [];
      setResults(searchResults);
      
      // Save to cache
      const dataToCache: CachedData = {
          timestamp: Date.now(),
          results: searchResults
      };
      localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
      
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
  }, [user, toast]);


  const fetchSuggestions = useCallback(async () => {
      if (!user) return;
      setIsLoading(true);
      setPageTitle("Suggestions for You");
      setResults([]);

      const cacheKey = `suggestions_cache_${user.uid}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
          try {
              const { timestamp, results: cachedResults }: CachedData = JSON.parse(cached);
              if (Date.now() - timestamp < SUGGESTIONS_CACHE_EXPIRATION_MS) {
                  setResults(shuffleArray([...cachedResults])); // Shuffle cached results on reload
                  setIsLoading(false);
                  return;
              }
          } catch (e) {
              console.error("Failed to parse suggestions cache", e);
              localStorage.removeItem(cacheKey);
          }
      }

      const { data, error } = await getSuggestedVideos(user.uid);
      if (error) {
          toast({ variant: "destructive", title: "Failed to load suggestions", description: error });
      } else if (data) {
          setResults(data || []);
          const dataToCache: CachedData = {
              timestamp: Date.now(),
              results: data
          };
          localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
      }
      setIsLoading(false);
  }, [user, toast]);


  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setResults([]);
      fetchSuggestions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, user]); // Depend on user to fetch suggestions when they log in

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

  const isShowingSuggestions = !hasSearched && !isLoading;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div
          className={cn(
            "w-full transition-all duration-500 ease-in-out",
            hasSearched || isShowingSuggestions
              ? "mb-8 text-center"
              : "flex h-[calc(60vh-80px)] flex-col items-center justify-center text-center"
          )}
        >
          <div className="flex items-center justify-center gap-4">
             <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-foreground font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                {isShowingSuggestions || hasSearched ? pageTitle : "TubeSeek"}
             </h1>
          </div>
          <p className={cn("mt-4 max-w-xl text-muted-foreground", (hasSearched || isShowingSuggestions) && "text-center mx-auto")}>
            Your intelligent, ad-free portal to YouTube. No shorts, just the content you want.
          </p>
          <div className={cn("mt-8 w-full max-w-2xl", (hasSearched || isShowingSuggestions) && "mx-auto")}>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} initialQuery={query || ''} />
          </div>
        </div>

        {isLoading && <LoadingSkeleton />}

        {!isLoading && (hasSearched || isShowingSuggestions) && results.length > 0 && (
          <VideoGrid videos={results} onPlayVideo={handleSelectVideo} />
        )}
        
        {!isLoading && (hasSearched || isShowingSuggestions) && results.length === 0 && (
            <div className="text-center text-muted-foreground flex flex-col items-center gap-4">
                <Logo className="w-16 h-16 text-muted-foreground/50"/>
                <h2 className="text-2xl font-semibold">{hasSearched ? "No Results Found" : "Try searching to get started"}</h2>
                <p>{hasSearched ? "We couldn't find any relevant videos for your search. Please try a different query." : "Start watching videos to help us build a feed of videos you'll love."}</p>
            </div>
        )}

      </main>
      <VideoPlayer
        video={selectedVideo}
        source="search"
        suggestions={results.filter(r => r.videoId !== selectedVideo?.videoId)}
        onPlaySuggestion={handleSelectVideo}
        onClose={handleClosePlayer}
      />
    </>
  );
}


export default withAuth(SearchPage);
