
'use server';

import { db } from '@/lib/firebase';
import { ref, set, get, remove, serverTimestamp } from 'firebase/database';
import type { SearchResult, LikedVideo, Subscription } from '@/types/youtube';

// Like/Unlike a video
export async function toggleLikeVideo(userId: string, video: SearchResult): Promise<{ success?: boolean; error?: string }> {
    if (!userId || !video) return { error: 'User ID and Video are required.' };

    const likeRef = ref(db, `user-likes/${userId}/${video.videoId}`);
    try {
        const snapshot = await get(likeRef);
        if (snapshot.exists()) {
            // Video is already liked, so unlike it
            await remove(likeRef);
        } else {
            // Video is not liked, so like it
            const likedVideo: Omit<LikedVideo, 'likedAt'> & { likedAt: any } = {
                ...video,
                likedAt: serverTimestamp()
            };
            await set(likeRef, likedVideo);
        }
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to update like status: ${errorMessage}` };
    }
}

// Subscribe/Unsubscribe to a channel
export async function toggleSubscription(userId: string, channelId: string, channelTitle: string): Promise<{ success?: boolean; error?: string }> {
    if (!userId || !channelId) return { error: 'User ID and Channel ID are required.' };

    const subscriptionRef = ref(db, `user-subscriptions/${userId}/${channelId}`);
    try {
        const snapshot = await get(subscriptionRef);
        if (snapshot.exists()) {
            // Already subscribed, so unsubscribe
            await remove(subscriptionRef);
        } else {
            // Not subscribed, so subscribe
            await set(subscriptionRef, { channelId, channelTitle, subscribedAt: serverTimestamp() });
        }
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to update subscription: ${errorMessage}` };
    }
}

// Get like and subscription status for a video
export async function getInteractionStatus(
    userId: string, 
    videoId: string, 
    channelId: string
): Promise<{ data?: { isLiked: boolean; isSubscribed: boolean }; error?: string }> {
    if (!userId || !videoId || !channelId) {
        return { error: 'User ID, Video ID, and Channel ID are required.' };
    }

    try {
        const likeRef = ref(db, `user-likes/${userId}/${videoId}`);
        const subscriptionRef = ref(db, `user-subscriptions/${userId}/${channelId}`);

        const [likeSnapshot, subscriptionSnapshot] = await Promise.all([
            get(likeRef),
            get(subscriptionRef)
        ]);
        
        return {
            data: {
                isLiked: likeSnapshot.exists(),
                isSubscribed: subscriptionSnapshot.exists()
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch interaction status: ${errorMessage}` };
    }
}


// Get all liked videos for a user
export async function getLikedVideos(userId: string): Promise<{ data?: LikedVideo[]; error?: string }> {
    if (!userId) return { error: 'User ID is required.' };

    const likesRef = ref(db, `user-likes/${userId}`);
    try {
        const snapshot = await get(likesRef);
        if (snapshot.exists()) {
            const data: LikedVideo[] = Object.values(snapshot.val());
            return { data: data.sort((a, b) => b.likedAt - a.likedAt) };
        }
        return { data: [] };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch liked videos: ${errorMessage}` };
    }
}

// Get all subscriptions for a user
export async function getSubscriptions(userId: string): Promise<{ data?: Subscription[]; error?: string }> {
    if (!userId) return { error: 'User ID is required.' };

    const subsRef = ref(db, `user-subscriptions/${userId}`);
    try {
        const snapshot = await get(subsRef);
        if (snapshot.exists()) {
            const data: Subscription[] = Object.values(snapshot.val());
            return { data: data.sort((a, b) => b.subscribedAt - a.subscribedAt) };
        }
        return { data: [] };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch subscriptions: ${errorMessage}` };
    }
}
