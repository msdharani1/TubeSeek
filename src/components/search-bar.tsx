
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";

export type SearchBarProps = {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
};

export function SearchBar({ onSearch, isLoading, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center">
      <div className="relative flex-1">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for videos..."
          className="w-full text-base bg-card border-2 border-border focus:border-primary pr-10 rounded-r-none"
          disabled={isLoading}
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
    </form>
  );
}
