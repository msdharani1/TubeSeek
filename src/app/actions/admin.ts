'use server';

import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { subDays, format, isValid } from 'date-fns';

type DashboardStats = {
    totalUsers: number;
    totalSearches: number;
    totalPlaylists: number;
    totalLikes: number;
    newUsersLast30Days: { date: string; count: number }[];
};

export async function getDashboardStats(adminEmail: string): Promise<{ data?: DashboardStats; error?: string }> {
    if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }

    try {
        const usersRef = ref(db, 'user-searches');
        const playlistsRef = ref(db, 'user-playlists');
        const likesRef = ref(db, 'user-likes');

        const [usersSnapshot, playlistsSnapshot, likesSnapshot] = await Promise.all([
            get(usersRef),
            get(playlistsRef),
            get(likesRef),
        ]);

        const usersData = usersSnapshot.val() || {};
        const playlistsData = playlistsSnapshot.val() || {};
        const likesData = likesSnapshot.val() || {};
        
        const totalUsers = Object.keys(usersData).length;

        let totalSearches = 0;
        let newUsersPerDay: { [key: string]: number } = {};
        
        // Initialize last 30 days
        for (let i = 0; i < 30; i++) {
            const date = format(subDays(new Date(), i), 'MMM dd');
            newUsersPerDay[date] = 0;
        }

        Object.values(usersData).forEach((userData: any) => {
            if (userData.searches) {
                totalSearches += Object.keys(userData.searches).length;
            }
             // User creation date from Firebase auth metadata is not stored in DB,
             // so we'll approximate with the first search date.
            if (userData.searches && Object.keys(userData.searches).length > 0) {
                 const firstSearch = Object.values(userData.searches).reduce((earliest: any, current: any) => {
                    return new Date(current.timestamp) < new Date(earliest.timestamp) ? current : earliest;
                 });
                 const creationDate = new Date(firstSearch.timestamp);
                 if (isValid(creationDate)) {
                    const diffDays = (new Date().getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
                    if (diffDays < 30) {
                        const dateStr = format(creationDate, 'MMM dd');
                         if (newUsersPerDay[dateStr] !== undefined) {
                            newUsersPerDay[dateStr]++;
                        }
                    }
                 }
            }
        });

        const newUsersLast30Days = Object.entries(newUsersPerDay)
            .map(([date, count]) => ({ date, count }))
            .reverse();

        let totalPlaylists = 0;
        Object.values(playlistsData).forEach((userPlaylists: any) => {
            if(userPlaylists.playlists){
                totalPlaylists += Object.keys(userPlaylists.playlists).length;
            }
        });
        
        let totalLikes = 0;
        Object.values(likesData).forEach((userLikes: any) => {
            totalLikes += Object.keys(userLikes).length;
        });
        
        const stats: DashboardStats = {
            totalUsers,
            totalSearches,
            totalPlaylists,
            totalLikes,
            newUsersLast30Days,
        };

        return { data: stats };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch dashboard stats: ${errorMessage}` };
    }
}
