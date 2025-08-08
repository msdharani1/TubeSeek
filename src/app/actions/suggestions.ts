'use server';

export async function getSearchSuggestions(query: string): Promise<{ data?: string[]; error?: string }> {
    if (!query) {
        return { data: [] };
    }

    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // This is not a critical error, so we can fail silently.
            console.error('Failed to fetch suggestions, status:', response.status);
            return { data: [] };
        }
        const data = await response.json();
        // The suggestions are in the second element of the response array
        if (Array.isArray(data) && Array.isArray(data[1])) {
            return { data: data[1] };
        }
        return { data: [] };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error(`Failed to fetch suggestions: ${errorMessage}`);
        return { error: `Failed to fetch suggestions: ${errorMessage}` };
    }
}
