
'use server';

import {
  YoutubeSearchResponseSchema,
  YoutubeVideosResponseSchema,
} from '@/types/youtube';
import type { SearchResult, SearchQuery, UserInfo } from '@/types/youtube';
import { db } from '@/lib/firebase';
import { ref, push, set, get, child } from 'firebase/database';

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
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?${searchParams.toString()}`
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('YouTube search API error:', errorData);
      return {
        error: `Failed to fetch from YouTube: ${errorData.error.message}`,
      };
    }

    const searchJson = await searchResponse.json();
    const parsedSearch = YoutubeSearchResponseSchema.safeParse(searchJson);

    if (!parsedSearch.success) {
      console.error(
        'Failed to parse YouTube search response:',
        parsedSearch.error
      );
      return { error: 'Received invalid data from YouTube.' };
    }

    const videoIds = parsedSearch.data.items.map((item) => item.id.videoId);
    if (videoIds.length === 0) {
      return { data: [] };
    }

    // Step 2: Get video details for the found video IDs
    const videosParams = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: videoIds.join(','),
      key: apiKey,
    });
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?${videosParams.toString()}`
    );

    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      console.error('YouTube videos API error:', errorData);
      return {
        error: `Failed to fetch video details: ${errorData.error.message}`,
      };
    }

    const videosJson = await videosResponse.json();
    const parsedVideos = YoutubeVideosResponseSchema.safeParse(videosJson);

    if (!parsedVideos.success) {
      console.error(
        'Failed to parse YouTube videos response:',
        parsedVideos.error
      );
      return { error: 'Received invalid video data from YouTube.' };
    }

    // Step 3: Format and return the results directly
    const results: SearchResult[] = parsedVideos.data.items.map((item) => ({
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: item.contentDetails.duration,
      viewCount: item.statistics.viewCount || '0',
      likeCount: item.statistics.likeCount || '0',
    }));

    return { data: results };
  } catch (error) {
    console.error(
      'An unexpected error occurred in searchAndRefineVideos:',
      error
    );
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred during the search.' };
  }
}

export async function saveSearchQuery(
  user: UserInfo,
  query: string,
  resultsCount: number
): Promise<{ success?: boolean; error?: string }> {
  if (!user || !user.uid || !query) {
    return { error: 'User ID and query are required.' };
  }
  if (!db) {
    return { error: 'Database connection is not available.' };
  }

  try {
    const searchData = {
      query: query.trim(),
      resultsCount: resultsCount,
      timestamp: new Date().toISOString(),
    };
    
    // Save user info and the search query
    const userSearchesRef = ref(db, `user-searches/${user.uid}/searches`);
    const newUserSearchRef = push(userSearchesRef);
    await set(newUserSearchRef, searchData);
    
    const userInfoRef = ref(db, `user-searches/${user.uid}/profile`);
    await set(userInfoRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save search query to Firebase:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to save search history: ${errorMessage}` };
  }
}

export async function getAllUserSearches(adminEmail: string): Promise<{ data?: Record<string, { profile: UserInfo; searches: SearchQuery[] }>; error?: string }> {
  if (adminEmail !== 'msdharaniofficial@gmail.com') {
    return { error: 'Unauthorized access.' };
  }

  if (!db) {
    return { error: 'Database connection is not available.' };
  }
  
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `user-searches`));
    if (snapshot.exists()) {
      const allSearches = snapshot.val();
      const formattedData: Record<string, { profile: UserInfo; searches: SearchQuery[] }> = {};

      for (const userId in allSearches) {
          const userData = allSearches[userId];
          const userSearches: SearchQuery[] = userData.searches ? Object.values(userData.searches) : [];
          
          formattedData[userId] = {
            profile: userData.profile || { email: 'Unknown User', uid: userId },
            searches: userSearches.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          };
      }

      return { data: formattedData };
    } else {
      return { data: {} };
    }
  } catch(error) {
      console.error('Failed to fetch all user searches from Firebase:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { error: `Failed to fetch search history: ${errorMessage}` };
  }
}

// Helper function to test Firebase connection
export async function testFirebaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!db) {
      return { success: false, error: 'Firebase database is not initialized' };
    }

    // Try to create a test reference
    const testRef = ref(db, 'connection-test');
    await set(testRef, { timestamp: new Date().toISOString() });
    
    return { success: true };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown connection error' 
    };
  }
}
