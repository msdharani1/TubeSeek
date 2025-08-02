
"use client";

import { useState } from "react";
import type { SearchResult } from "@/types/youtube";
import { searchAndRefineVideos } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/logo";
import { SearchBar } from "@/components/search-bar";
import { VideoGrid } from "@/components/video-grid";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { VideoPlayer } from "@/components/video-player";
import { Frown } from "lucide-react";

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    if (!query) return;

    setIsLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      const response = await searchAndRefineVideos(query);
      if (response.error) {
        throw new Error(response.error);
      }
      setResults(response.data || []);
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

  const handlePlayVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <div
          className={cn(
            "w-full transition-all duration-500 ease-in-out",
            hasSearched
              ? "mb-8"
              : "flex h-[60vh] flex-col items-center justify-center text-center"
          )}
        >
          <div className="flex items-center gap-4">
             <Logo className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
             <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-foreground font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                TubeSeek
             </h1>
          </div>
          <p className={cn("mt-4 max-w-xl text-muted-foreground", hasSearched && "text-center mx-auto")}>
            Your intelligent portal to YouTube. Enter a query to discover AI-refined video results.
          </p>
          <div className={cn("mt-8 w-full max-w-2xl", hasSearched && "mx-auto")}>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>

        {isLoading && <LoadingSkeleton />}

        {!isLoading && hasSearched && results.length > 0 && (
          <VideoGrid videos={results} onPlayVideo={handlePlayVideo} />
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
        videoId={selectedVideoId}
        onClose={() => setSelectedVideoId(null)}
      />
    </>
  );
}
