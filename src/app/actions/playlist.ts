
'use server';

import type { Playlist, PlaylistItem, SearchResult } from '@/types/youtube';
import { db } from '@/lib/firebase';
import { ref, push, set, get, child, serverTimestamp, remove, query, orderByChild, equalTo } from 'firebase/database';

// Get all playlists for a user
export async function getPlaylists(userId: string): Promise<{ data?: Playlist[]; error?: string }> {
    if (!userId) return { error: 'User ID is required.' };

    const playlistsRef = ref(db, `user-playlists/${userId}/playlists`);
    try {
        const snapshot = await get(playlistsRef);
        if (snapshot.exists()) {
            const data: Playlist[] = Object.values(snapshot.val());
            return { data: data.sort((a,b) => b.createdAt - a.createdAt) };
        }
        return { data: [] };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch playlists: ${errorMessage}` };
    }
}


// Create a new playlist
export async function createPlaylist(userId: string, name: string): Promise<{ data?: Playlist, error?: string }> {
    if (!userId || !name) return { error: 'User ID and playlist name are required.' };
    
    const playlistsRef = ref(db, `user-playlists/${userId}/playlists`);
    const newPlaylistRef = push(playlistsRef);
    
    const playlistData = {
        id: newPlaylistRef.key,
        name: name.trim(),
        videoCount: 0,
        createdAt: serverTimestamp(),
    };

    try {
        await set(newPlaylistRef, playlistData);
        // We need to fetch the data back to get the server-generated timestamp
        const snapshot = await get(newPlaylistRef);
        return { data: snapshot.val() };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to create playlist: ${errorMessage}` };
    }
}

// Add/remove a video from multiple playlists
export async function updateVideoInPlaylists(
    userId: string, 
    video: SearchResult, 
    playlistIds: string[],
    videoIsCurrentlyIn: string[]
): Promise<{ success?: boolean; error?: string }> {
    if (!userId || !video) return { error: 'User ID and video are required.' };

    const toAdd = playlistIds.filter(id => !videoIsCurrentlyIn.includes(id));
    const toRemove = videoIsCurrentlyIn.filter(id => !playlistIds.includes(id));

    try {
        // Add to new playlists
        for (const playlistId of toAdd) {
            let actualPlaylistId = playlistId;

            // Handle creating the 'Favorite' playlist if it's selected but doesn't exist
            if (playlistId === 'favorite-default') {
                const playlistsRef = ref(db, `user-playlists/${userId}/playlists`);
                const q = query(playlistsRef, orderByChild('name'), equalTo('Favorite'));
                const snapshot = await get(q);

                if (!snapshot.exists()) {
                    const favoritePlaylistRef = push(playlistsRef);
                    const playlistData = {
                        id: favoritePlaylistRef.key,
                        name: 'Favorite',
                        videoCount: 0,
                        createdAt: serverTimestamp(),
                    };
                    await set(favoritePlaylistRef, playlistData);
                    actualPlaylistId = favoritePlaylistRef.key!;
                } else {
                    actualPlaylistId = Object.keys(snapshot.val())[0];
                }
            }
            
            const playlistItemsRef = ref(db, `user-playlists/${userId}/items/${actualPlaylistId}`);
            const newItemRef = push(playlistItemsRef);
            const playlistItem: Omit<PlaylistItem, 'addedAt'> & { addedAt: any } = {
                ...video,
                id: newItemRef.key!,
                addedAt: serverTimestamp(),
            };
            await set(newItemRef, playlistItem);
            
            // Update thumbnail and video count
            const playlistRef = ref(db, `user-playlists/${userId}/playlists/${actualPlaylistId}`);
            const playlistSnapshot = await get(playlistRef);
            if (playlistSnapshot.exists()) {
                const updates: any = {
                    videoCount: (playlistSnapshot.val().videoCount || 0) + 1,
                };
                if (!playlistSnapshot.val().thumbnail) {
                    updates.thumbnail = video.thumbnail;
                }
                await set(child(playlistRef, 'videoCount'), updates.videoCount);
                if(updates.thumbnail) {
                    await set(child(playlistRef, 'thumbnail'), updates.thumbnail);
                }
            }
        }

        // Remove from old playlists
        for (const playlistId of toRemove) {
            const itemsRef = ref(db, `user-playlists/${userId}/items/${playlistId}`);
            const itemQuery = query(itemsRef, orderByChild('videoId'), equalTo(video.videoId));
            const snapshot = await get(itemQuery);

            if (snapshot.exists()) {
                const itemKey = Object.keys(snapshot.val())[0];
                await remove(ref(db, `user-playlists/${userId}/items/${playlistId}/${itemKey}`));
                
                // Update video count
                const playlistRef = ref(db, `user-playlists/${userId}/playlists/${playlistId}`);
                const playlistSnapshot = await get(playlistRef);
                if (playlistSnapshot.exists()) {
                    await set(child(playlistRef, 'videoCount'), Math.max(0, (playlistSnapshot.val().videoCount || 1) - 1));
                }
            }
        }

        return { success: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to update playlists: ${errorMessage}` };
    }
}


// Get all videos for a specific playlist
export async function getPlaylistVideos(userId: string, playlistId: string): Promise<{ data?: PlaylistItem[], error?: string, playlistName?: string }> {
    if (!userId || !playlistId) return { error: 'User and playlist ID are required.' };
    
    let actualPlaylistId = playlistId;
    let playlistName = "Playlist";

    // Handle the case for the default favorite playlist placeholder
    if (playlistId === 'favorite-default') {
        const playlistsRef = ref(db, `user-playlists/${userId}/playlists`);
        const q = query(playlistsRef, orderByChild('name'), equalTo('Favorite'));
        const snapshot = await get(q);
        if (snapshot.exists()) {
            actualPlaylistId = Object.keys(snapshot.val())[0];
        } else {
            // If it doesn't exist in DB, it's an empty playlist
            return { data: [], playlistName: "Favorite" };
        }
    }

    const itemsRef = ref(db, `user-playlists/${userId}/items/${actualPlaylistId}`);
    const playlistRef = ref(db, `user-playlists/${userId}/playlists/${actualPlaylistId}`);

    try {
        const itemsSnapshot = await get(itemsRef);
        const playlistSnapshot = await get(playlistRef);

        playlistName = playlistSnapshot.exists() ? playlistSnapshot.val().name : "Playlist";

        if (itemsSnapshot.exists()) {
            const data: PlaylistItem[] = Object.values(itemsSnapshot.val());
            return { data: data.sort((a,b) => b.addedAt - a.addedAt), playlistName };
        }
        return { data: [], playlistName };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch playlist videos: ${errorMessage}` };
    }
}


export async function getPlaylistsForVideo(userId: string, videoId: string): Promise<{ data?: string[]; error?: string }> {
    if (!userId || !videoId) return { error: 'User ID and video ID are required.' };
    
    try {
        const userItemsRef = ref(db, `user-playlists/${userId}/items`);
        const snapshot = await get(userItemsRef);
        if (!snapshot.exists()) {
            return { data: [] };
        }

        const itemsByPlaylist = snapshot.val();
        const playlistIds: string[] = [];

        for (const playlistId in itemsByPlaylist) {
            const items = itemsByPlaylist[playlistId];
            for (const itemId in items) {
                if (items[itemId].videoId === videoId) {
                    playlistIds.push(playlistId);
                    break; 
                }
            }
        }
        return { data: playlistIds };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to get playlists for video: ${errorMessage}` };
    }
}
