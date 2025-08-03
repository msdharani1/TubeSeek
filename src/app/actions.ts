
'use server';

import {
  YoutubeSearchResponseSchema,
  YoutubeVideosResponseSchema,
} from '@/types/youtube';
import type { SearchResult, SearchQuery, UserInfo, WatchedVideo } from '@/types/youtube';
import { db } from '@/lib/firebase';
import { ref, push, set, get, child, query, limitToLast, serverTimestamp, remove, orderByChild, equalTo } from 'firebase/database';
import { getLikedVideos, getSubscriptions } from './actions/video-interactions';

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
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
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
    const searchData: Omit<SearchQuery, 'timestamp'> & { timestamp: any } = {
      query: query.trim(),
      resultsCount: resultsCount,
      timestamp: serverTimestamp(),
    };
    
    // Save the search query
    const userSearchesRef = ref(db, `user-searches/${user.uid}/searches`);
    const newUserSearchRef = push(userSearchesRef);
    await set(newUserSearchRef, searchData);
    
    // Save or update user profile info
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

export async function saveVideoToHistory(
  userId: string,
  video: SearchResult
): Promise<{ success?: boolean; error?: string }> {
  if (!userId || !video) {
    return { error: 'User ID and video data are required.' };
  }
  if (!db) {
    return { error: 'Database connection is not available.' };
  }

  try {
    const historyRef = ref(db, `user-watch-history/${userId}`);
    
    // Check if the video already exists in the history
    const videoQuery = query(historyRef, orderByChild('videoId'), equalTo(video.videoId));
    const snapshot = await get(videoQuery);

    if (snapshot.exists()) {
      // If it exists, remove the old entry. A new one will be added below.
      // This effectively updates its 'watchedAt' time and moves it to the "top"
      const existingKey = Object.keys(snapshot.val())[0];
      await remove(ref(db, `user-watch-history/${userId}/${existingKey}`));
    }

    const historyItem: Omit<WatchedVideo, 'id' | 'watchedAt'> & { watchedAt: any } = {
        ...video,
        watchedAt: serverTimestamp()
    };
    
    // Add the new or updated video entry
    const newHistoryRef = push(historyRef);
    await set(newHistoryRef, historyItem);

    // After adding, check the total count and trim if it exceeds 50
    const allHistorySnapshot = await get(historyRef);
    if (allHistorySnapshot.exists()) {
      const allHistory = allHistorySnapshot.val();
      const allKeys = Object.keys(allHistory);
      
      if (allKeys.length > 50) {
        // Sort keys by timestamp to find the oldest one
        const sortedHistory = Object.entries(allHistory).sort(([, a], [, b]) => (a as any).watchedAt - (b as any).watchedAt);
        const keysToDeleteCount = sortedHistory.length - 50;
        const keysToDelete = sortedHistory.slice(0, keysToDeleteCount).map(([key]) => key);

        for (const key of keysToDelete) {
          await remove(ref(db, `user-watch-history/${userId}/${key}`));
        }
      }
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Failed to save video to history:', errorMessage);
    return { error: `Failed to save video to history: ${errorMessage}` };
  }
}


export async function getUserHistory(
  userId: string
): Promise<{ data?: WatchedVideo[]; error?: string }> {
  if (!userId) {
    return { error: "User ID is required." };
  }
  if (!db) {
    return { error: "Database connection is not available." };
  }

  try {
    const historyRef = ref(db, `user-watch-history/${userId}`);
    const historyQuery = query(historyRef, limitToLast(50));
    const snapshot = await get(historyQuery);

    if (snapshot.exists()) {
      const historyData = snapshot.val();
      const videos: WatchedVideo[] = Object.keys(historyData).map(key => ({
        id: key,
        ...historyData[key],
      })).sort((a, b) => b.watchedAt - a.watchedAt); // Sort descending by watched date
      
      return { data: videos };
    } else {
      return { data: [] };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Failed to get user history:", errorMessage);
    return { error: `Failed to fetch history: ${errorMessage}` };
  }
}

async function getUserSearchHistory(userId: string): Promise<{ data?: SearchQuery[]; error?: string }> {
    if (!userId) {
        return { error: "User ID is required." };
    }
    const historyRef = ref(db, `user-searches/${userId}/searches`);
    const historyQuery = query(historyRef, limitToLast(20)); // Get last 20 search queries
    try {
        const snapshot = await get(historyQuery);
        if (snapshot.exists()) {
            const historyData = snapshot.val();
            const queries: SearchQuery[] = Object.values(historyData);
            return { data: queries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) };
        }
        return { data: [] };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `Failed to fetch search history: ${errorMessage}` };
    }
}


export async function getSuggestedVideos(userId: string): Promise<{ data?: SearchResult[]; error?: string }> {
    if (!userId) {
        return { error: "User ID is required to get suggestions." };
    }

    try {
        // 1. Fetch all user interaction data in parallel
        const [
            likedVideosRes,
            historyVideosRes,
            subscriptionsRes,
            searchHistoryRes
        ] = await Promise.all([
            getLikedVideos(userId),
            getUserHistory(userId),
            getSubscriptions(userId),
            getUserSearchHistory(userId)
        ]);

        const searchQueries = new Set<string>();

        // 2. Extract search terms from the data
        // Priority: Search History > Subscriptions > Liked Videos > Watch History
        
        // From Search History (highest priority)
        if (searchHistoryRes.data) {
            searchHistoryRes.data.slice(0, 5).forEach(item => searchQueries.add(item.query));
        }

        // From Subscriptions
        if (subscriptionsRes.data) {
            subscriptionsRes.data.slice(0, 5).forEach(sub => searchQueries.add(sub.channelTitle));
        }

        // From Liked Videos
        if (likedVideosRes.data) {
            likedVideosRes.data.slice(0, 3).forEach(video => searchQueries.add(video.channelTitle));
        }
        
        // From Watch History
        if (historyVideosRes.data && searchQueries.size < 5) {
             historyVideosRes.data.slice(0, 3).forEach(video => searchQueries.add(video.channelTitle));
        }
        
        // Fallback if no data is available
        if (searchQueries.size === 0) {
            const fallbackQueries = ["New music videos", "Tech reviews", "Cooking tutorials", "Workout at home", "Stand up comedy"];
            fallbackQueries.forEach(q => searchQueries.add(q));
        }
        
        // 3. Fetch videos for each search query
        const allSuggestedVideos: SearchResult[] = [];
        const videoIdSet = new Set<string>();

        const searchPromises = Array.from(searchQueries).map(query => searchAndRefineVideos(query));
        const searchResults = await Promise.all(searchPromises);

        for (const result of searchResults) {
            if (result.data) {
                // Add up to 4 videos per query to ensure diversity
                for (const video of result.data.slice(0, 4)) {
                    if (!videoIdSet.has(video.videoId)) {
                        allSuggestedVideos.push(video);
                        videoIdSet.add(video.videoId);
                    }
                }
            }
        }
        
        // 4. Shuffle and slice to get the final list
        const shuffledVideos = allSuggestedVideos.sort(() => Math.random() - 0.5);

        return { data: shuffledVideos.slice(0, 20) };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Error generating suggested videos:", errorMessage);
        return { error: `Failed to generate suggestions: ${errorMessage}` };
    }
}
