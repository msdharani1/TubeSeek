
'use server';

import { db } from '@/lib/firebase';
import { ref, push, set, get } from 'firebase/database';
import { subDays, format, isValid, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

// --- Client-facing action to log a single click ---
export async function logUserClick(userId: string, pathname: string): Promise<{ success: boolean }> {
    if (!userId || !pathname) {
        return { success: false };
    }

    // Filter out admin pages and other non-tracked routes
    const trackedPaths = /^\/(search|history|liked|playlists|settings|privacy-policy)?\/?$|^\/playlists\/[^/]+$/;
    if (pathname.startsWith('/admin') || !trackedPaths.test(pathname)) {
        return { success: false };
    }
    
    // Normalize path
    const normalizedPath = pathname === '/' ? '/search' : pathname;

    try {
        const clicksRef = ref(db, `user-clicks/${userId}`);
        const newClickRef = push(clicksRef);
        await set(newClickRef, {
            pathname: normalizedPath,
            timestamp: new Date().toISOString(),
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to log user click:', error);
        return { success: false }; // Fail silently on the client
    }
}


// --- Admin action to get click analytics ---
type ClickAnalytics = {
    totalClicks: number;
    clicksLast30Days: { date: string; count: number }[];
    clicksByPage: { page: string; count: number }[];
};

export async function getClickAnalytics(adminEmail: string): Promise<{ data?: ClickAnalytics; error?: string }> {
    if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }

    try {
        const clicksRef = ref(db, 'user-clicks');
        const snapshot = await get(clicksRef);

        if (!snapshot.exists()) {
            return { data: { totalClicks: 0, clicksLast30Days: [], clicksByPage: [] } };
        }

        const allClicksData = snapshot.val();
        let totalClicks = 0;
        const clicksByPage: { [key: string]: number } = {};
        
        const thirtyDaysAgo = startOfDay(subDays(new Date(), 29));
        const today = endOfDay(new Date());
        const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
        const clicksPerDay: { [key: string]: number } = {};
        dateRange.forEach(date => {
            clicksPerDay[format(date, 'MMM dd')] = 0;
        });

        for (const userId in allClicksData) {
            const userClicks = allClicksData[userId];
            for (const clickId in userClicks) {
                totalClicks++;
                const click = userClicks[clickId];
                
                // Aggregate by page
                const page = click.pathname || 'unknown';
                clicksByPage[page] = (clicksByPage[page] || 0) + 1;

                // Aggregate by day for the chart
                const clickDate = new Date(click.timestamp);
                if (isValid(clickDate) && clickDate >= thirtyDaysAgo && clickDate <= today) {
                    const dateStr = format(clickDate, 'MMM dd');
                    if (clicksPerDay[dateStr] !== undefined) {
                        clicksPerDay[dateStr]++;
                    }
                }
            }
        }

        const clicksLast30Days = Object.entries(clicksPerDay)
            .map(([date, count]) => ({ date, count }));

        const sortedClicksByPage = Object.entries(clicksByPage)
            .map(([page, count]) => ({ page, count }))
            .sort((a, b) => b.count - a.count);

        const analytics: ClickAnalytics = {
            totalClicks,
            clicksLast30Days,
            clicksByPage: sortedClicksByPage,
        };

        return { data: analytics };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch click analytics: ${errorMessage}` };
    }
}
