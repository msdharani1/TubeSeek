
'use server';

import {
  YoutubeSearchResponseSchema,
  YoutubeVideosResponseSchema,
} from '@/types/youtube';
import type { SearchResult, SearchQuery, UserInfo, WatchedVideo, FilterOptions } from '@/types/youtube';
import { db } from '@/lib/firebase';
import { ref, push, set, get, query, limitToLast, serverTimestamp, remove, orderByChild, equalTo, update } from 'firebase/database';
import { getLikedVideos, getSubscriptions } from './actions/video-interactions';
import { getUserSuggestionStatus } from './actions/user-settings';
import { isoDurationToSeconds } from '@/lib/utils';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper function to make API requests with key rotation
async function fetchWithYouTubeKeyRotation(url: string): Promise<Response> {
    const apiKeys = [
        process.env.YOUTUBE_API_KEY,
        process.env.YOUTUBE_API_KEY2,
        process.env.YOUTUBE_API_KEY3,
        process.env.YOUTUBE_API_KEY4,
        process.env.YOUTUBE_API_KEY5
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
  q: string,
  filters: FilterOptions = {},
  isCategorySearch: boolean = false
): Promise<{ data?: SearchResult[]; error?: string }> {
  try {
    let finalQuery = q;

    // For category searches, modify query to get better, localized results.
    if (isCategorySearch) {
        finalQuery = `Latest Tamil ${q}`;
    }

    const searchParamsObj: Record<string, string> = {
      part: 'snippet',
      maxResults: '20',
      type: 'video',
      q: finalQuery
    };

    if (filters.videoDuration && filters.videoDuration !== 'any') {
      searchParamsObj.videoDuration = filters.videoDuration;
    }
    if (filters.publishedAfter) {
      searchParamsObj.publishedAfter = filters.publishedAfter;
    }

    // Step 1: Perform two searches in parallel: one for relevance, one for date.
    // This gives a mix of popular and new content.
    const relevanceSearchParams = new URLSearchParams({ ...searchParamsObj, order: filters.order || 'relevance' });
    const dateSearchParams = new URLSearchParams({ ...searchParamsObj, order: 'date' });
    
    const [relevanceResponse, dateResponse] = await Promise.all([
        fetchWithYouTubeKeyRotation(`${YOUTUBE_API_BASE_URL}/search?${relevanceSearchParams.toString()}`),
        fetchWithYouTubeKeyRotation(`${YOUTUBE_API_BASE_URL}/search?${dateSearchParams.toString()}`)
    ]);

    let relevanceJson = await relevanceResponse.json();
    let dateJson = await dateResponse.json();
    
    // Fallback logic for category searches if Tamil yields no results
    if (isCategorySearch && relevanceJson.items.length === 0) {
        console.log("No Tamil results, falling back to English for category:", q);
        relevanceSearchParams.set('q', `Latest English ${q}`);
        const fallbackResponse = await fetchWithYouTubeKeyRotation(`${YOUTUBE_API_BASE_URL}/search?${relevanceSearchParams.toString()}`);
        relevanceJson = await fallbackResponse.json();
    }


    const parsedRelevance = YoutubeSearchResponseSchema.safeParse(relevanceJson);
    const parsedDate = YoutubeSearchResponseSchema.safeParse(dateJson);

    if (!parsedRelevance.success) {
      console.error('Failed to parse YouTube relevance search response:', parsedRelevance.error);
      return { error: 'Received invalid data from YouTube.' };
    }
     if (!parsedDate.success) {
      console.error('Failed to parse YouTube date search response:', parsedDate.error);
      // We can still proceed with relevance results if date fails
    }

    // Step 2: Combine and de-duplicate video IDs from both searches
    const videoIdSet = new Set<string>();
    parsedRelevance.data.items.forEach(item => item.id.videoId && videoIdSet.add(item.id.videoId));
    if (parsedDate.success) {
        parsedDate.data.items.forEach(item => item.id.videoId && videoIdSet.add(item.id.videoId));
    }
    
    const videoIds = Array.from(videoIdSet);

    if (videoIds.length === 0) {
      return { data: [] };
    }

    // Step 3: Get video details for the combined list of video IDs
    const videosParams = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: videoIds.join(','),
      maxResults: '40' // Fetch details for up to 40 unique videos
    });

    const videosResponse = await fetchWithYouTubeKeyRotation(
       `${YOUTUBE_API_BASE_URL}/videos?${videosParams.toString()}`
    );

    const videosJson = await videosResponse.json();
    const parsedVideos = YoutubeVideosResponseSchema.safeParse(videosJson);

    if (!parsedVideos.success) {
      console.error('Failed to parse YouTube videos response:', parsedVideos.error);
      return { error: 'Received invalid video data from YouTube.' };
    }

    // Step 4: Format and return the results
    const resultsMap = new Map<string, SearchResult>();
    parsedVideos.data.items.forEach((item) => {
      resultsMap.set(item.id, {
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
      });
    });

    // Re-order results to match the original combined order, ensuring the final list is consistent.
    const orderedResults = videoIds.map(id => resultsMap.get(id)).filter(Boolean) as SearchResult[];

    return { data: orderedResults.slice(0, 20) }; // Return a consistent number of results
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
  user: UserInfo | { uid: string, displayName: string | null },
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
    
    // Save or update user profile info only if they are not a guest
    if ('email' in user) {
        const userInfoRef = ref(db, `user-searches/${user.uid}/profile`);
        const email = 'email' in user ? user.email : null;
        const photoURL = 'photoURL' in user ? user.photoURL : null;
        
        await set(userInfoRef, {
            email: email,
            displayName: user.displayName,
            photoURL: photoURL
        });
    }

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
        const usersRef = ref(db, 'user-searches');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const allUserData = snapshot.val();
            
            // Process the data to sort searches for each user
            for (const userId in allUserData) {
                if (allUserData[userId].searches) {
                    const searches = Object.values(allUserData[userId].searches) as SearchQuery[];
                    // Sort searches by timestamp descending
                    searches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    allUserData[userId].searches = searches;
                }
            }

            return { data: allUserData };
        } else {
            return { data: {} };
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch user searches: ${errorMessage}` };
    }
}


export async function saveVideoToHistory(
  userId: string,
  video: SearchResult
): Promise<{ success?: boolean; error?: string }> {
  if (!userId || !video) {
    return { error: 'User ID and video data are required.' };
  }

  try {
    const historyRef = ref(db, `user-watch-history/${userId}`);
    const videoQuery = query(historyRef, orderByChild('videoId'), equalTo(video.videoId));
    const snapshot = await get(videoQuery);

    const durationSeconds = isoDurationToSeconds(video.duration);

    if (snapshot.exists()) {
      const existingKey = Object.keys(snapshot.val())[0];
      const existingData = snapshot.val()[existingKey];
      // Update timestamp and duration, but keep progress
      const updates = {
        watchedAt: serverTimestamp(),
        durationSeconds: durationSeconds,
        progressSeconds: existingData.progressSeconds || 0
      };
      await update(ref(db, `user-watch-history/${userId}/${existingKey}`), updates);

    } else {
      const historyItem: Omit<WatchedVideo, 'id' | 'watchedAt'> & { watchedAt: any } = {
          ...video,
          watchedAt: serverTimestamp(),
          durationSeconds: durationSeconds,
          progressSeconds: 0,
      };
      const newHistoryRef = push(historyRef);
      await set(newHistoryRef, historyItem);
    }
    
    // Trim old history entries if count exceeds 50
    const allHistorySnapshot = await get(query(historyRef, limitToLast(100))); // Fetch more to be safe
    if (allHistorySnapshot.exists()) {
      const allHistory = allHistorySnapshot.val();
      const allKeys = Object.entries(allHistory).sort(([, a], [, b]) => (a as any).watchedAt - (b as any).watchedAt);
      
      if (allKeys.length > 50) {
        const keysToDeleteCount = allKeys.length - 50;
        const keysToDelete = allKeys.slice(0, keysToDeleteCount).map(([key]) => key);

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

export async function updateVideoProgress(
    userId: string,
    videoId: string,
    progressSeconds: number
): Promise<{ success?: boolean; error?: string }> {
    if (!userId || !videoId) {
        return { error: 'User ID and Video ID are required.' };
    }
    try {
        const historyRef = ref(db, `user-watch-history/${userId}`);
        const videoQuery = query(historyRef, orderByChild('videoId'), equalTo(videoId));
        const snapshot = await get(videoQuery);

        if (snapshot.exists()) {
            const existingKey = Object.keys(snapshot.val())[0];
            await update(ref(db, `user-watch-history/${userId}/${existingKey}`), {
                progressSeconds: Math.floor(progressSeconds)
            });
            return { success: true };
        }
        // If it doesn't exist, we don't create it here. saveVideoToHistory should do that.
        return { success: false, error: 'History record not found.' };

    } catch (error) {
        // This can fail silently as it's not critical.
        console.warn('Failed to update video progress:', error);
        return { success: false };
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


export async function getSuggestedVideos(userId: string): Promise<{ data?: SearchResult[]; error?: string; suggestionsEnabled?: boolean }> {
    if (!userId) {
        return { data: [], suggestionsEnabled: true };
    }

    try {
        // 1. Check if suggestions are enabled for the user
        const statusRes = await getUserSuggestionStatus(userId);
        if (statusRes.error || statusRes.data === false) { // Note: check for explicitly false
            return { data: [], suggestionsEnabled: false, error: statusRes.error };
        }

        // 2. Fetch all user interaction data in parallel
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

        // 3. Extract search terms from the data
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
        
        // 4. Fetch videos for each search query
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
        
        // 5. Slice to get the final list
        return { data: allSuggestedVideos.slice(0, 20), suggestionsEnabled: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Error generating suggested videos:", errorMessage);
        return { error: `Failed to generate suggestions: ${errorMessage}` };
    }
}

    