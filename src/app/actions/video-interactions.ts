
'use server';

import { db } from '@/lib/firebase';
import { ref, set, get, remove, serverTimestamp } from 'firebase/database';

// Like/Unlike a video
export async function toggleLikeVideo(userId: string, videoId: string): Promise<{ success?: boolean; error?: string }> {
    if (!userId || !videoId) return { error: 'User ID and Video ID are required.' };

    const likeRef = ref(db, `user-likes/${userId}/${videoId}`);
    try {
        const snapshot = await get(likeRef);
        if (snapshot.exists()) {
            // Video is already liked, so unlike it
            await remove(likeRef);
        } else {
            // Video is not liked, so like it
            await set(likeRef, { videoId, likedAt: serverTimestamp() });
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
