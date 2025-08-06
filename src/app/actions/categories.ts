
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';
import { subDays, format } from 'date-fns';
import type { SearchResult } from '@/types/youtube';
import { searchAndRefineVideos } from '@/app/actions';

type CachedCategory = {
    date: string;
    videos: SearchResult[];
};

export async function getCategoryVideos(
    category: 'Music' | 'Trending' | 'News' | 'Kids'
): Promise<{ data?: SearchResult[]; error?: string }> {
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const categoryKey = category.toLowerCase();
    const cacheRef = ref(db, `cached-categories/${categoryKey}`);

    try {
        // 1. Check for a valid cache entry for today
        const snapshot = await get(cacheRef);
        if (snapshot.exists()) {
            const cachedData: CachedCategory = snapshot.val();
            if (cachedData.date === today && cachedData.videos.length > 0) {
                return { data: cachedData.videos };
            }
        }

        // 2. If no valid cache, fetch fresh data from YouTube
        let publishedAfter: string | undefined;
        let order: 'viewCount' | 'date' = 'viewCount';
        let query = category;

        if (category === 'Music') {
            publishedAfter = subDays(new Date(), 30).toISOString();
        } else if (category === 'Trending') {
            publishedAfter = subDays(new Date(), 7).toISOString();
        } else if (category === 'Kids') {
            query = "Kids cartoons rhymes";
            order = 'viewCount';
        } else { // News
            order = 'date';
        }

        const { data: freshVideos, error } = await searchAndRefineVideos(
            query,
            { order, publishedAfter },
            true
        );

        if (error) {
            return { error };
        }

        if (freshVideos && freshVideos.length > 0) {
            // 3. Store the new data in the cache
            const dataToCache: CachedCategory = {
                date: today,
                videos: freshVideos,
            };
            await set(cacheRef, dataToCache);
            return { data: freshVideos };
        }

        return { data: [] };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error(`Failed to get or cache ${category} videos:`, errorMessage);
        // Fallback to direct search if firebase fails
        return searchAndRefineVideos(category, {}, true);
    }
}
