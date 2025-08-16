
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import { getSearchSuggestions } from "@/app/actions/suggestions";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

export type SearchBarProps = {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string | null;
};

// A new Portal component to handle rendering outside the current DOM hierarchy
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
};


export function SearchBar({ onSearch, isLoading, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery || '');
  const [originalQuery, setOriginalQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const suggestionsListRef = useRef<HTMLUListElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setQuery(initialQuery || '');
  }, [initialQuery]);

  const updatePosition = useCallback(() => {
    if (searchContainerRef.current) {
      const rect = searchContainerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [updatePosition]);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
      if(searchQuery.length < 2) {
          setSuggestions([]);
          return;
      }
      setIsSuggestionsLoading(true);
      const { data } = await getSearchSuggestions(searchQuery);
      setSuggestions(data || []);
      setOriginalQuery(searchQuery);
      setIsSuggestionsLoading(false);
      setHighlightedIndex(-1); // Reset highlight when suggestions change
  }, []);


  useEffect(() => {
    if (suggestionsListRef.current && highlightedIndex >= 0) {
      const highlightedElement = suggestionsListRef.current.children[highlightedIndex] as HTMLLIElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setHighlightedIndex(-1); // Reset on manual typing

    if (newQuery.length > 1) {
      setShowSuggestions(true);
      updatePosition();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(newQuery);
      }, 300);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    }
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query);
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
        const newIndex = highlightedIndex + 1;
        if (newIndex < suggestions.length) {
            setHighlightedIndex(newIndex);
            setQuery(suggestions[newIndex]);
        }
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const newIndex = highlightedIndex - 1;
        setHighlightedIndex(newIndex);
        if (newIndex >= 0) {
            setQuery(suggestions[newIndex]);
        } else {
            setQuery(originalQuery);
        }
    }
  };
  
  const formatSuggestion = (suggestion: string, query: string) => {
    const wordCount = query.trim().split(/\s+/).length;
    if ((wordCount === 3 || wordCount === 4) && suggestion.toLowerCase().startsWith(query.toLowerCase())) {
      return `...${suggestion.substring(query.length)}`;
    }
    return suggestion;
  }


  const handleFocus = () => {
    updatePosition();
    if(query && query.length > 1) setShowSuggestions(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center relative" ref={searchContainerRef}>
      <div className="relative flex-1">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
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
      <Button type="submit" disabled={isLoading || !query} variant="icon" className="rounded-l-none" aria-label="Search">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
      </Button>

       {showSuggestions && query && (query.length > 1) && (
        <Portal>
            <Card 
                style={{ 
                    '--top': `${position.top}px`,
                    '--left': `${position.left}px`,
                    '--width': `${position.width}px`,
                } as React.CSSProperties}
                className="fixed top-16 left-0 w-full mt-0 sm:absolute sm:top-[var(--top)] sm:left-[var(--left)] sm:w-[var(--width)] sm:mt-2 max-h-80 overflow-y-auto z-[9999]">
                {isSuggestionsLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading suggestions...</div>
                ) : suggestions.length > 0 ? (
                    <ul ref={suggestionsListRef}>
                        {suggestions.map((s, i) => (
                            <li key={i}>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSuggestionClick(s);
                                }}
                                onMouseEnter={() => setHighlightedIndex(i)}
                                className={cn(
                                    "w-full text-left px-4 py-2 hover:bg-muted/50 flex items-center gap-2",
                                    i === highlightedIndex && "bg-muted/80"
                                )}
                            >
                                <Search className="h-4 w-4 text-muted-foreground"/>
                                <span className="flex-1">{formatSuggestion(s, originalQuery)}</span>
                            </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-4 text-center text-muted-foreground">No suggestions found.</div>
                )}
            </Card>
        </Portal>
      )}
    </form>
  );
}
