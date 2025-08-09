
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set, child, serverTimestamp, update, query, orderByKey } from 'firebase/database';
import type { UserInfo } from '@/types/youtube';
import { subDays, format, isValid, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';


type UserWithSettings = UserInfo & { 
    id: string; 
    suggestionsEnabled: boolean;
    joinDate: string;
};

// Admin action to get all users and their settings
export async function getAllUsersWithSettings(adminEmail: string): Promise<{ data?: UserWithSettings[]; error?: string }> {
    if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }

    try {
        const usersRef = ref(db, 'user-searches');
        const settingsRef = ref(db, 'user-settings');
        
        const [usersSnapshot, settingsSnapshot] = await Promise.all([
            get(usersRef),
            get(settingsRef)
        ]);

        if (!usersSnapshot.exists()) {
            return { data: [] };
        }

        const allUsersData = usersSnapshot.val();
        const allSettingsData = settingsSnapshot.val() || {};

        const result: UserWithSettings[] = Object.keys(allUsersData).map(userId => {
            const userData = allUsersData[userId];
            const profile = userData.profile || {};
            const settings = allSettingsData[userId] || {};
            
            let joinDate = new Date().toISOString(); // Fallback to now
            if (userData.searches && Object.keys(userData.searches).length > 0) {
                 try {
                    const firstSearch = Object.values(userData.searches).reduce((earliest: any, current: any) => {
                        return new Date(current.timestamp) < new Date(earliest.timestamp) ? current : earliest;
                    });
                    const creationDate = new Date(firstSearch.timestamp);
                    if (isValid(creationDate)) {
                        joinDate = creationDate.toISOString();
                    }
                 } catch (e) { /* ignore */ }
            }

            return {
                id: userId,
                uid: userId,
                email: profile.email || null,
                displayName: profile.displayName || null,
                photoURL: profile.photoURL || null,
                suggestionsEnabled: settings.suggestionsEnabled === true,
                joinDate: joinDate,
            };
        });

        return { data: result };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch users and settings: ${errorMessage}` };
    }
}


// Admin action to toggle suggestion status for a user
export async function toggleUserSuggestion(adminEmail: string, userId: string, isEnabled: boolean): Promise<{ success?: boolean; error?: string }> {
    if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }
    if (!userId) {
        return { error: 'User ID is required.' };
    }

    try {
        const userSettingsRef = ref(db, `user-settings/${userId}`);
        const snapshot = await get(userSettingsRef);
        if(snapshot.exists()){
            await update(userSettingsRef, {
                suggestionsEnabled: isEnabled
            });
        } else {
             await set(userSettingsRef, {
                suggestionsEnabled: isEnabled
            });
        }
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to update user setting: ${errorMessage}` };
    }
}


// Admin action to toggle all users' suggestion status
export async function toggleAllUserSuggestions(adminEmail: string, isEnabled: boolean): Promise<{ success?: boolean; error?: string }> {
    if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }

    try {
        const usersRef = ref(db, 'user-searches');
        const usersSnapshot = await get(usersRef);

        if (!usersSnapshot.exists()) {
            return { success: true }; // No users to update
        }

        const allUserIds = Object.keys(usersSnapshot.val());
        const updates: { [key: string]: any } = {};

        allUserIds.forEach(userId => {
            updates[`/user-settings/${userId}/suggestionsEnabled`] = isEnabled;
        });

        await update(ref(db), updates);
        return { success: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to update all user settings: ${errorMessage}` };
    }
}


// Action for a user to check their own suggestion status
export async function getUserSuggestionStatus(userId: string): Promise<{ data?: boolean; error?: string }> {
     if (!userId) {
        return { error: 'User ID is required.' };
    }
    try {
        const settingRef = ref(db, `user-settings/${userId}/suggestionsEnabled`);
        const snapshot = await get(settingRef);
        
        // Default to false if the setting doesn't exist
        const isEnabled = snapshot.exists() ? snapshot.val() : false;
        
        return { data: isEnabled };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch user suggestion status: ${errorMessage}` };
    }
}


// Admin action to get overall user activity
type UserActivity = {
    totalInteractions: number;
    interactionsLast30Days: { date: string; count: number }[];
    totalUsers: number;
    totalSearches: number;
    totalPlaylists: number;
    totalLikes: number;
};
export async function getUserActivity(adminEmail: string): Promise<{ data?: UserActivity; error?: string }> {
    if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }

    try {
        const [
            searchesSnapshot, 
            historySnapshot, 
            likesSnapshot,
            playlistsSnapshot
        ] = await Promise.all([
            get(ref(db, 'user-searches')),
            get(ref(db, 'user-watch-history')),
            get(ref(db, 'user-likes')),
            get(ref(db, 'user-playlists'))
        ]);
        
        const searchesData = searchesSnapshot.val() || {};
        const historyData = historySnapshot.val() || {};
        const likesData = likesSnapshot.val() || {};
        const playlistsData = playlistsSnapshot.val() || {};
        
        let totalSearches = 0;
        Object.values(searchesData).forEach((user: any) => { totalSearches += Object.keys(user.searches || {}).length });
        
        let totalLikes = 0;
        Object.values(likesData).forEach((user: any) => { totalLikes += Object.keys(user || {}).length });

        let totalPlaylists = 0;
        Object.values(playlistsData).forEach((user: any) => { totalPlaylists += Object.keys(user.playlists || {}).length });

        const totalUsers = Object.keys(searchesData).length;

        // For daily interactions, we'll check history, likes, and searches
        const thirtyDaysAgo = startOfDay(subDays(new Date(), 29));
        const today = endOfDay(new Date());
        const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
        const interactionsPerDay: { [key: string]: number } = {};
        dateRange.forEach(date => {
            interactionsPerDay[format(date, 'MMM dd')] = 0;
        });
        
        const countInteraction = (timestamp: string | number) => {
            const date = new Date(timestamp);
            if (isValid(date) && date >= thirtyDaysAgo && date <= today) {
                const dateStr = format(date, 'MMM dd');
                if (interactionsPerDay[dateStr] !== undefined) {
                    interactionsPerDay[dateStr]++;
                }
            }
        };

        Object.values(historyData).forEach((user: any) => Object.values(user).forEach((item: any) => countInteraction(item.watchedAt)));
        Object.values(likesData).forEach((user: any) => Object.values(user).forEach((item: any) => countInteraction(item.likedAt)));
        Object.values(searchesData).forEach((user: any) => Object.values(user.searches || {}).forEach((item: any) => countInteraction(item.timestamp)));
        
        const interactionsLast30Days = Object.entries(interactionsPerDay).map(([date, count]) => ({ date, count }));
        const totalInteractions = totalSearches + totalLikes + Object.keys(historyData).reduce((acc, userId) => acc + Object.keys(historyData[userId]).length, 0);

        const activity: UserActivity = {
            totalInteractions,
            interactionsLast30Days,
            totalUsers,
            totalSearches,
            totalPlaylists,
            totalLikes,
        };

        return { data: activity };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch user activity: ${errorMessage}` };
    }
}
