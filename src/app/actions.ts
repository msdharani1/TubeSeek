'use server';

import { refineSearchResults, type SearchResult } from '@/ai/flows/refine-search-results';
import { YoutubeSearchResponseSchema, YoutubeVideosResponseSchema } from '@/types/youtube';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function searchAndRefineVideos(
  query: string
): Promise<{ data?: SearchResult[]; error?: string }> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('YouTube API key is not configured.');
    return { error: 'Server configuration error. Please contact support.' };
  }

  try {
    // Step 1: Search for videos to get video IDs
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: query,
      maxResults: '20',
      type: 'video',
      key: apiKey,
    });
    const searchResponse = await fetch(`${YOUTUBE_API_BASE_URL}/search?${searchParams.toString()}`);

    if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        console.error('YouTube search API error:', errorData);
        return { error: `Failed to fetch from YouTube: ${errorData.error.message}` };
    }

    const searchJson = await searchResponse.json();
    const parsedSearch = YoutubeSearchResponseSchema.safeParse(searchJson);

    if (!parsedSearch.success) {
      console.error('Failed to parse YouTube search response:', parsedSearch.error);
      return { error: 'Received invalid data from YouTube.' };
    }

    const videoIds = parsedSearch.data.items.map(item => item.id.videoId);
    if (videoIds.length === 0) {
      return { data: [] };
    }

    // Step 2: Get video details for the found video IDs
    const videosParams = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: videoIds.join(','),
      key: apiKey,
    });
    const videosResponse = await fetch(`${YOUTUBE_API_BASE_URL}/videos?${videosParams.toString()}`);
    
    if (!videosResponse.ok) {
        const errorData = await videosResponse.json();
        console.error('YouTube videos API error:', errorData);
        return { error: `Failed to fetch video details: ${errorData.error.message}` };
    }

    const videosJson = await videosResponse.json();
    const parsedVideos = YoutubeVideosResponseSchema.safeParse(videosJson);

    if (!parsedVideos.success) {
        console.error('Failed to parse YouTube videos response:', parsedVideos.error);
        return { error: 'Received invalid video data from YouTube.' };
    }

    // Step 3: Format initial results for AI refinement
    const initialResults: SearchResult[] = parsedVideos.data.items.map(item => ({
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: item.contentDetails.duration,
      viewCount: item.statistics.viewCount || '0',
      likeCount: item.statistics.likeCount || '0',
    }));

    // Step 4: Refine results with GenAI
    const refinedResults = await refineSearchResults({
      query,
      results: initialResults,
    });
    
    return { data: refinedResults };

  } catch (error) {
    console.error('An unexpected error occurred in searchAndRefineVideos:', error);
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: 'An unknown error occurred during the search.' };
  }
}
