
'use server';

import { db } from '@/lib/firebase';
import { ref, push, set, serverTimestamp, get, update } from 'firebase/database';

export type FeedbackData = {
    type: 'feedback' | 'bug';
    rating?: number;
    name?: string;
    email?: string;
    message: string;
    attachmentUrl?: string | null;
    userId?: string | null;
    userAgent: string;
    status?: 'open' | 'fixed';
};

export type FeedbackEntry = FeedbackData & {
    id: string;
    submittedAt: number;
}

export async function submitFeedback(data: FeedbackData): Promise<{ success: boolean; error?: string }> {
    try {
        const feedbackRef = ref(db, 'feedback');
        const newFeedbackRef = push(feedbackRef);

        const payload = {
            ...data,
            submittedAt: serverTimestamp(),
            status: data.type === 'bug' ? 'open' : undefined, // Bugs are 'open' by default
        };

        await set(newFeedbackRef, payload);

        return { success: true };
    } catch (error) {
        console.error('Failed to submit feedback:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to submit feedback: ${errorMessage}` };
    }
}


// --- Admin Actions ---

export async function getAllFeedback(adminEmail: string): Promise<{ data?: FeedbackEntry[]; error?: string }> {
    if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }

    try {
        const feedbackRef = ref(db, 'feedback');
        const snapshot = await get(feedbackRef);

        if (!snapshot.exists()) {
            return { data: [] };
        }

        const allFeedbackData = snapshot.val();
        const result: FeedbackEntry[] = Object.keys(allFeedbackData).map(key => ({
            id: key,
            ...allFeedbackData[key]
        })).sort((a, b) => b.submittedAt - a.submittedAt); // Sort by most recent

        return { data: result };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to fetch feedback: ${errorMessage}` };
    }
}


export async function updateBugStatus(adminEmail: string, feedbackId: string, status: 'fixed'): Promise<{ success: boolean; error?: string }> {
     if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }
    if (!feedbackId) {
        return { success: false, error: 'Feedback ID is required.' };
    }

    try {
        const feedbackItemRef = ref(db, `feedback/${feedbackId}`);
        await update(feedbackItemRef, { status: status });
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to update bug status: ${errorMessage}` };
    }
}
