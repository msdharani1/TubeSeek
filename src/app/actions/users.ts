
'use server';

import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { isValid } from 'date-fns';
import type { UserInfo } from '@/types/youtube';

export type UserWithJoinDate = UserInfo & {
    id: string;
    joinDate: string;
};

export async function getAllUsers(adminEmail: string): Promise<{ data?: UserWithJoinDate[]; error?: string }> {
    if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }

    try {
        const usersRef = ref(db, 'user-searches');
        const usersSnapshot = await get(usersRef);

        if (!usersSnapshot.exists()) {
            return { data: [] };
        }

        const allUsersData = usersSnapshot.val();
        
        const result: UserWithJoinDate[] = Object.keys(allUsersData).map(userId => {
            const userData = allUsersData[userId];
            const profile = userData.profile || {};
            
            let joinDate = 'N/A';
            if (userData.searches && Object.keys(userData.searches).length > 0) {
                 try {
                    const firstSearch = Object.values(userData.searches).reduce((earliest: any, current: any) => {
                        return new Date(current.timestamp) < new Date(earliest.timestamp) ? current : earliest;
                    });
                    const creationDate = new Date(firstSearch.timestamp);
                    if (isValid(creationDate)) {
                        joinDate = creationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    }
                 } catch (e) {
                    // Ignore if timestamp is invalid for some reason
                 }
            }

            return {
                id: userId,
                uid: userId,
                email: profile.email || null,
                displayName: profile.displayName || null,
                photoURL: profile.photoURL || null,
                joinDate: joinDate,
            };
        });

        // Sort users by join date, most recent first
        result.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());

        return { data: result };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch users: ${errorMessage}` };
    }
}
