
"use client";

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from 'lucide-react';
import type { FilterOptions } from '@/types/youtube';
import { cn } from '@/lib/utils';

type SearchFilterProps = {
  currentFilters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
};

export function SearchFilter({ currentFilters, onFilterChange }: SearchFilterProps) {
  const [order, setOrder] = useState(currentFilters.order || 'relevance');
  const [duration, setDuration] = useState(currentFilters.videoDuration || 'any');
  
  const handleOpenChange = (open: boolean) => {
    if (!open) { // When the dropdown closes
        // Apply filters only if they have changed
        if(order !== currentFilters.order || duration !== currentFilters.videoDuration) {
            onFilterChange({ order, videoDuration: duration });
        }
    } else { // When dropdown opens, sync state with props
        setOrder(currentFilters.order || 'relevance');
        setDuration(currentFilters.videoDuration || 'any');
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="px-3 sm:px-4">
          <Filter className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={order} onValueChange={setOrder}>
          <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date">Upload Date</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="viewCount">View Count</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Duration</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={duration} onValueChange={setDuration}>
          <DropdownMenuRadioItem value="any">Any</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="short">Short (&lt; 4 min)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="medium">Medium (4-20 min)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="long">Long (&gt; 20 min)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
