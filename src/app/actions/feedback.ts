
'use server';

import { db } from '@/lib/firebase';
import { ref, push, set, serverTimestamp } from 'firebase/database';

type FeedbackData = {
    type: 'feedback' | 'bug';
    name?: string;
    email?: string;
    message: string;
    attachmentUrl?: string | null;
    userId?: string | null;
    userAgent: string;
};

export async function submitFeedback(data: FeedbackData): Promise<{ success: boolean; error?: string }> {
    try {
        const feedbackRef = ref(db, 'feedback');
        const newFeedbackRef = push(feedbackRef);

        const payload = {
            ...data,
            submittedAt: serverTimestamp()
        };

        await set(newFeedbackRef, payload);

        return { success: true };
    } catch (error) {
        console.error('Failed to submit feedback:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to submit feedback: ${errorMessage}` };
    }
}
