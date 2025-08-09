
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import { getSearchSuggestions } from "@/app/actions/suggestions";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

export type SearchBarProps = {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
};

export function SearchBar({ onSearch, isLoading, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
      if(searchQuery.length < 2) {
          setSuggestions([]);
          return;
      }
      setIsSuggestionsLoading(true);
      const { data } = await getSearchSuggestions(searchQuery);
      setSuggestions(data || []);
      setIsSuggestionsLoading(false);
      setHighlightedIndex(-1); // Reset highlight when suggestions change
  }, []);


  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        if(query && showSuggestions) fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, showSuggestions, fetchSuggestions]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSuggestionClick(suggestions[highlightedIndex]);
    } else {
        setShowSuggestions(false);
        onSearch(query);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  }

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex(prevIndex => 
            prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
        );
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex(prevIndex => 
            prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center relative" ref={searchContainerRef}>
      <div className="relative flex-1">
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if(e.target.value.length > 1) {
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
          }}
          onFocus={() => {
            if(query.length > 1) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for videos..."
          className="w-full text-base bg-card border-2 border-border focus:border-primary pr-10 rounded-r-none"
          disabled={isLoading}
          autoComplete="off"
        />
        {query && !isLoading && (
            <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-muted/50"
                onClick={handleClear}
            >
                <X className="h-5 w-5"/>
                <span className="sr-only">Clear search</span>
            </Button>
        )}
      </div>
      <Button type="submit" disabled={isLoading} variant="icon" className="rounded-l-none" aria-label="Search">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
      </Button>

       {showSuggestions && (query.length > 1) && (
        <Card className={cn(
            "fixed sm:absolute top-16 sm:top-full left-0 sm:left-auto mt-0 sm:mt-2 w-full sm:w-full max-h-80 overflow-y-auto z-[9999999999999999999999999]"
        )}>
            {isSuggestionsLoading ? (
                 <div className="p-4 text-center text-muted-foreground">Loading suggestions...</div>
            ) : suggestions.length > 0 ? (
                <ul>
                    {suggestions.map((s, i) => (
                        <li key={i}>
                           <button
                             type="button"
                             onClick={() => handleSuggestionClick(s)}
                             className={cn(
                                 "w-full text-left px-4 py-2 hover:bg-muted/50 flex items-center gap-2",
                                 i === highlightedIndex && "bg-muted/80"
                             )}
                           >
                            <Search className="h-4 w-4 text-muted-foreground"/>
                            <span className="flex-1">{s}</span>
                           </button>
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="p-4 text-center text-muted-foreground">No suggestions found.</div>
            )}
        </Card>
      )}
    </form>
  );
}
