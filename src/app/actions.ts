
'use server';

import {
  YoutubeSearchResponseSchema,
  YoutubeVideosResponseSchema,
} from '@/types/youtube';
import type { SearchResult, SearchQuery, UserInfo, WatchedVideo } from '@/types/youtube';
import { db } from '@/lib/firebase';
import { ref, push, set, get, child, query, limitToLast, serverTimestamp, remove, orderByChild, equalTo, orderByKey, startAfter, limitToFirst, endBefore } from 'firebase/database';
import { getLikedVideos, getSubscriptions } from './actions/video-interactions';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper function to make API requests with key rotation
async function fetchWithYouTubeKeyRotation(url: string): Promise<Response> {
    const apiKeys = [
        process.env.YOUTUBE_API_KEY,
        process.env.YOUTUBE_API_KEY2,
        process.env.YOUTUBE_API_KEY3
    ].filter(Boolean); // Filter out any undefined/empty keys

    if (apiKeys.length === 0) {
        throw new Error('Server configuration error: No YouTube API keys found.');
    }

    let lastError: any = null;

    for (const key of apiKeys) {
        const urlWithKey = `${url}&key=${key}`;
        try {
            const response = await fetch(urlWithKey);
            if (response.ok) {
                return response; // Success, return the response
            }
            // Check for quota-like errors to decide if we should rotate the key
            if (response.status === 403 || response.status === 429) {
                 const errorData = await response.json();
                 console.warn(`API key failed with status ${response.status}. Trying next key. Error: ${errorData.error.message}`);
                 lastError = errorData;
                 continue; // Move to the next key
            }
            // For other errors, fail fast
            const errorData = await response.json();
            console.error('YouTube API error (non-rotatable):', errorData);
            throw new Error(`Failed to fetch from YouTube: ${errorData.error.message}`);

        } catch (error) {
            // Catch network errors or errors from the fetch call itself
            console.warn(`Request failed for a key. Trying next key. Error: ${error}`);
            lastError = error;
        }
    }
    
    // If all keys failed
    console.error("All YouTube API keys failed.", lastError);
    const finalErrorMessage = lastError?.error?.message || 'The service is temporarily unavailable. Please try again later.';
    throw new Error(`YouTube API Error: ${finalErrorMessage}`);
}

export async function searchAndRefineVideos(
  query: string
): Promise<{ data?: SearchResult[]; error?: string }> {
  try {
    // Step 1: Search for videos to get video IDs
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: query,
      maxResults: '20',
      type: 'video',
    });
    
    const searchResponse = await fetchWithYouTubeKeyRotation(
        `${YOUTUBE_API_BASE_URL}/search?${searchParams.toString()}`
    );

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
    });

    const videosResponse = await fetchWithYouTubeKeyRotation(
       `${YOUTUBE_API_BASE_URL}/videos?${videosParams.toString()}`
    );

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

export async function getUsersForAdmin(adminEmail: string, startAfterKey?: string | null): Promise<{ data?: { users: (UserInfo & { id: string })[], nextCursor: string | null }; error?: string }> {
    if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }
    if (!db) {
        return { error: 'Database connection is not available.' };
    }

    const PAGE_SIZE = 10;
    try {
        const usersRef = ref(db, 'user-searches');
        let usersQuery;

        if (startAfterKey) {
            usersQuery = query(usersRef, orderByKey(), startAfter(startAfterKey), limitToFirst(PAGE_SIZE + 1));
        } else {
            usersQuery = query(usersRef, orderByKey(), limitToFirst(PAGE_SIZE + 1));
        }
        
        const snapshot = await get(usersQuery);
        if (snapshot.exists()) {
            const allUsersData = snapshot.val();
            const users: (UserInfo & { id: string })[] = [];
            
            for (const userId in allUsersData) {
                const profile = allUsersData[userId].profile || {};
                users.push({
                    id: userId,
                    uid: userId,
                    email: profile.email || "N/A",
                    displayName: profile.displayName || "N/A",
                    photoURL: profile.photoURL || null,
                });
            }

            let nextCursor: string | null = null;
            if (users.length > PAGE_SIZE) {
                const nextUser = users.pop(); 
                nextCursor = nextUser!.id;
            }
            
            return { data: { users, nextCursor } };
        } else {
            return { data: { users: [], nextCursor: null } };
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch users: ${errorMessage}` };
    }
}

export async function getUserSearchHistoryForAdmin(adminEmail: string, userId: string, startAfterKey?: number | null): Promise<{ data?: { searches: SearchQuery[], nextCursor: number | null }; error?: string }> {
     if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }
    if (!db) {
        return { error: 'Database connection is not available.' };
    }

    const PAGE_SIZE = 10;

    try {
        const searchesRef = ref(db, `user-searches/${userId}/searches`);
        
        let searchesQuery;
        // Firebase RTDB queries with limitToLast are tricky for pagination. 
        // We fetch items sorted by timestamp. The oldest item in the current batch
        // becomes the `endBefore` value for the next page fetch.
        if (startAfterKey) {
            searchesQuery = query(searchesRef, orderByChild('timestamp'), endBefore(startAfterKey), limitToLast(PAGE_SIZE));
        } else {
            searchesQuery = query(searchesRef, orderByChild('timestamp'), limitToLast(PAGE_SIZE));
        }

        const snapshot = await get(searchesQuery);
        if (snapshot.exists()) {
            const searchesData = snapshot.val();
            const searches: SearchQuery[] = Object.entries(searchesData).map(([key, value]) => ({
                id: key,
                ...(value as Omit<SearchQuery, 'id'>)
            }));
            
            // Firebase RTDB limitToLast returns in ascending order, so we reverse to show newest first.
            searches.reverse(); 

            let nextCursor: number | null = null;
            if (searches.length === PAGE_SIZE) {
               // The next cursor is the timestamp of the *oldest* item in the current batch.
               const lastSearch = searches[searches.length - 1];
               nextCursor = lastSearch.timestamp as any; 
            }
            
            return { data: { searches, nextCursor } };
        } else {
            return { data: { searches: [], nextCursor: null } };
        }

    } catch (error) {
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
                // Add up to 8 videos per query to ensure diversity
                for (const video of result.data.slice(0, 8)) {
                    if (!videoIdSet.has(video.videoId)) {
                        allSuggestedVideos.push(video);
                        videoIdSet.add(video.videoId);
                    }
                }
            }
        }
        
        // 4. Slice to get the final list
        return { data: allSuggestedVideos.slice(0, 20) };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Error generating suggested videos:", errorMessage);
        return { error: `Failed to generate suggestions: ${errorMessage}` };
    }
}
