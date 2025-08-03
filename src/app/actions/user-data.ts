
'use server';

import { db } from '@/lib/firebase';
import { ref, remove } from 'firebase/database';

// Clear all watch history for a user
export async function clearWatchHistory(userId: string): Promise<{ success?: boolean; error?: string }> {
    if (!userId) return { error: 'User ID is required.' };

    const historyRef = ref(db, `user-watch-history/${userId}`);
    try {
        await remove(historyRef);
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error('Failed to clear watch history:', errorMessage);
        return { error: `Failed to clear watch history: ${errorMessage}` };
    }
}

// Delete all playlists for a user
export async function deleteAllPlaylists(userId: string): Promise<{ success?: boolean; error?: string }> {
    if (!userId) return { error: 'User ID is required.' };

    const playlistsRef = ref(db, `user-playlists/${userId}`);
    try {
        await remove(playlistsRef);
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error('Failed to delete playlists:', errorMessage);
        return { error: `Failed to delete playlists: ${errorMessage}` };
    }
}
