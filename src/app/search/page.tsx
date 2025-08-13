
import { Suspense } from "react";
import type { Metadata } from 'next';
import { RippleWaveLoader } from "@/components/ripple-wave-loader";
import { SearchClient } from "@/components/search-client";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const videoId = typeof searchParams.v === 'string' ? searchParams.v : '';
  
  const siteName = 'TubeSeek';
  const author = 'MS Dharani';
  const baseUrl = 'https://www.tubeseek.msdharani.com';
  
  if (videoId) {
    try {
        // We can't fetch full video details without an API call from the server,
        // which might be complex here. We'll use a generic but clear title.
        // A more advanced implementation might use a server action to fetch video title.
        return {
            title: 'Watching Video',
            description: 'Watching a video on TubeSeek, an intelligent, ad-free portal to YouTube.',
            openGraph: {
                title: 'Watching Video on TubeSeek',
                description: 'Join me watching this video on TubeSeek!',
                type: 'video.other',
                url: `${baseUrl}/search?v=${videoId}`,
            },
            twitter: {
                 card: 'player',
                 title: 'Watching Video on TubeSeek',
                 description: 'An ad-free, focused video watching experience.',
                 // Twitter player card requires specific player URLs and sizes.
                 // This is a simplified version.
            }
        };
    } catch (e) {
      // Fallback for video
    }
  }

  if (query) {
    return {
      title: `Results for "${query}"`,
      description: `Search for "${query}" on TubeSeek. Find relevant videos without ads or distractions.`,
      keywords: [query, 'video search', 'YouTube search', 'ad-free'],
      authors: [{ name: author }],
      openGraph: {
        title: `Search results for "${query}" | ${siteName}`,
        description: `Find the best videos for "${query}" on TubeSeek.`,
        url: `${baseUrl}/search?q=${encodeURIComponent(query)}`,
        siteName: siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `"${query}" on TubeSeek`,
        description: `Search for "${query}" on an ad-free, distraction-free platform.`,
      },
    };
  }

  // Default metadata for the search page
  return {
    title: 'Search',
    description: 'Search for any video on TubeSeek, an intelligent, distraction-free portal to YouTube. No ads, no shorts, just the content you want.',
    keywords: ['YouTube search', 'video search engine', 'ad-free youtube', 'intelligent search'],
    authors: [{ name: author }],
    openGraph: {
        title: `Search | ${siteName}`,
        description: 'The best way to search for videos online, without the noise.',
        url: `${baseUrl}/search`,
        siteName: siteName,
        type: 'website',
    },
     twitter: {
        card: 'summary',
        title: `Search on TubeSeek`,
        description: 'Intelligent, ad-free video search.',
    },
  };
}

export default function SearchPage() {
   return (
      <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background"><RippleWaveLoader /><p className="mt-4 text-muted-foreground">Loading...</p></div>}>
          <SearchClient />
      </Suspense>
   )
}
