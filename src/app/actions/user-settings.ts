
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set, child, serverTimestamp, update, query, orderByKey } from 'firebase/database';
import type { UserInfo } from '@/types/youtube';

type UserWithSettings = UserInfo & { id: string; suggestionsEnabled: boolean };

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
            const profile = allUsersData[userId].profile || {};
            const settings = allSettingsData[userId] || {};
            return {
                id: userId,
                uid: userId,
                email: profile.email || "N/A",
                displayName: profile.displayName || "N/A",
                photoURL: profile.photoURL || null,
                suggestionsEnabled: settings.suggestionsEnabled === true // Default to false
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
