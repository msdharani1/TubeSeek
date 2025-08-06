'use server';

type ApiKeyStatus = {
    name: string;
    status: 'Active' | 'Quota Reached' | 'Error';
    error?: string;
};

// This is a very low-cost endpoint to check API key validity.
const YOUTUBE_API_CHECK_URL = 'https://www.googleapis.com/youtube/v3/search?part=id&q=test';

export async function checkApiKeysStatus(adminEmail: string): Promise<{ data?: ApiKeyStatus[]; error?: string }> {
    if (adminEmail !== 'msdharaniofficial@gmail.com') {
        return { error: 'Unauthorized access.' };
    }

    const apiKeys = [
        { name: "API Key 1", key: process.env.YOUTUBE_API_KEY },
        { name: "API Key 2", key: process.env.YOUTUBE_API_KEY2 },
        { name: "API Key 3", key: process.env.YOUTUBE_API_KEY3 },
        { name: "API Key 4", key: process.env.YOUTUBE_API_KEY4 },
        { name: "API Key 5", key: process.env.YOUTUBE_API_KEY5 }
    ].filter(k => k.key); // Filter out any undefined/empty keys

    if (apiKeys.length === 0) {
        return { data: [{ name: "No Keys Found", status: "Error", error: "No API keys are configured on the server." }] };
    }

    const statusPromises = apiKeys.map(async ({ name, key }) => {
        try {
            const response = await fetch(`${YOUTUBE_API_CHECK_URL}&key=${key}`);
            
            if (response.ok) {
                return { name, status: 'Active' as const };
            }

            if (response.status === 403) {
                 const errorData = await response.json();
                 const reason = errorData.error?.errors?.[0]?.reason;
                 if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
                    return { name, status: 'Quota Reached' as const };
                 }
                 return { name, status: 'Error' as const, error: `Forbidden: ${reason || 'Unknown reason'}` };
            }
            
            const errorText = await response.text();
            return { name, status: 'Error' as const, error: `HTTP ${response.status}: ${errorText}` };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown fetch error occurred.';
            return { name, status: 'Error' as const, error: errorMessage };
        }
    });

    try {
        const statuses = await Promise.all(statusPromises);
        return { data: statuses };
    } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
         return { error: `Failed to check API key statuses: ${errorMessage}` };
    }
}
