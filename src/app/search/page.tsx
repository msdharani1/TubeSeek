
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import type { SearchResult, FilterOptions } from "@/types/youtube";
import { searchAndRefineVideos, saveSearchQuery, getSuggestedVideos } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { withAuth, useAuth } from '@/context/auth-context';

import { Logo } from "@/components/logo";
import { VideoGrid } from "@/components/video-grid";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { VideoPlayer } from "@/components/video-player";
import { Loader2 } from "lucide-react";
import { SearchFilter } from "@/components/search-filter";

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
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);
    const [suggestionsEnabled, setSuggestionsEnabled] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
      order: 'relevance',
      videoDuration: 'any',
    });
    
    const query = searchParams.get('q');
    const videoId = searchParams.get('v');

    const hasSearched = query !== null;
    const isShowingSuggestions = !hasSearched && !isLoading && suggestionsEnabled;

    const performSearch = useCallback(async (searchQuery: string, newFilters?: FilterOptions) => {
      if (!searchQuery) return;

      const currentFilters = newFilters || filters;

      setIsLoading(true);
      setResults([]);

      const cacheKey = `youtube_search_${searchQuery.toLowerCase()}_${currentFilters.order}_${currentFilters.videoDuration}`;
      const cachedItem = localStorage.getItem(cacheKey);

      if (cachedItem) {
          try {
              const cachedData: CachedData = JSON.parse(cachedItem);
              if (Date.now() - cachedData.timestamp < SEARCH_CACHE_EXPIRATION_MS) {
                  setResults(cachedData.results);
                  setIsLoading(false);
                  return; 
              }
          } catch (e) {
              console.error("Failed to parse cache", e);
              localStorage.removeItem(cacheKey);
          }
      }
      
      try {
        const response = await searchAndRefineVideos(searchQuery, currentFilters);
        if (response.error) {
          throw new Error(response.error);
        }
        const searchResults = response.data || [];
        setResults(searchResults);
        
        const dataToCache: CachedData = {
            timestamp: Date.now(),
            results: searchResults
        };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        
        if (user && !newFilters) { // Only save query on initial search, not filter change
          const userInfo = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
          };
          saveSearchQuery(userInfo, searchQuery, searchResults.length)
            .then(saveResult => {
              if (saveResult.error) {
                  console.warn("Failed to save search history:", saveResult.error);
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
    }, [user, toast, filters]);

    const fetchSuggestions = useCallback(async () => {
        if (!user) return;
        
        setResults([]);
        const { data, error, suggestionsEnabled: isEnabled } = await getSuggestedVideos(user.uid);
        
        setSuggestionsEnabled(isEnabled || false);
        if (!isEnabled) {
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        const cacheKey = `suggestions_cache_${user.uid}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            try {
                const { timestamp, results: cachedResults }: CachedData = JSON.parse(cached);
                if (Date.now() - timestamp < SUGGESTIONS_CACHE_EXPIRATION_MS) {
                    setResults(shuffleArray([...cachedResults]));
                    setIsLoading(false);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse suggestions cache", e);
                localStorage.removeItem(cacheKey);
            }
        }

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

    const handleFilterChange = (newFilters: FilterOptions) => {
      setFilters(newFilters);
      if (query) {
        performSearch(query, newFilters);
      }
    };

    useEffect(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
        fetchSuggestions();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, user]); 

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
      return () => {
        document.body.classList.remove("overflow-hidden");
      };
    }, [selectedVideo]);

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

    const getPageTitle = () => {
      if(query) return `Results for "${query}"`;
      if(isShowingSuggestions) return "Suggestions for You";
      return "";
    }
    
    const showEmptyState = !isLoading && !query && (!suggestionsEnabled || results.length === 0);

    return (
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {(hasSearched || isShowingSuggestions) && (
             <div className="flex items-center justify-between mb-8">
                 <h1 className="text-xl md:text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
                  {hasSearched && (
                    <SearchFilter 
                      currentFilters={filters}
                      onFilterChange={handleFilterChange}
                    />
                  )}
             </div>
          )}
          
          {isLoading && <LoadingSkeleton />}

          {!isLoading && (hasSearched || isShowingSuggestions) && results.length > 0 && (
            <VideoGrid videos={results} onPlayVideo={handleSelectVideo} />
          )}
          
          {!isLoading && hasSearched && results.length === 0 && (
               <div className="text-center text-muted-foreground flex flex-col items-center gap-4 mt-20">
                  <Logo className="w-16 h-16 text-muted-foreground/50"/>
                  <h2 className="text-2xl font-semibold">No Results Found</h2>
                  <p className="max-w-md">We couldn't find any relevant videos for your search. Please try a different query or adjust your filters.</p>
              </div>
          )}

          {showEmptyState && (
              <div className="text-center text-muted-foreground flex flex-col items-center gap-4 mt-20">
                  <Logo className="w-16 h-16 text-muted-foreground/50"/>
                  <h2 className="text-2xl font-semibold">Ready to dive in?</h2>
                  <p className="max-w-md">Use the search bar above to find exactly what you're looking for.</p>
              </div>
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

function SearchPageWrapper() {
   return (
      <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Loading...</p></div>}>
          <SearchPage />
      </Suspense>
   )
}

export default withAuth(SearchPageWrapper);
