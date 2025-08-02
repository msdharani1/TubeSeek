// src/ai/flows/refine-search-results.ts
'use server';

/**
 * @fileOverview Refines YouTube search results using AI to improve relevance.
 *
 * - refineSearchResults - A function that refines the search results.
 * - RefineSearchResultsInput - The input type for the refineSearchResults function.
 * - RefineSearchResultsOutput - The return type for the refineSearchResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchResultSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  duration: z.string(),
  viewCount: z.string(),
  likeCount: z.string(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

const RefineSearchResultsInputSchema = z.object({
  query: z.string().describe('The original search query.'),
  results: z.array(SearchResultSchema).describe('The initial list of search results.'),
});
export type RefineSearchResultsInput = z.infer<typeof RefineSearchResultsInputSchema>;

const RefineSearchResultsOutputSchema = z.array(SearchResultSchema).describe('The refined list of search results.');
export type RefineSearchResultsOutput = z.infer<typeof RefineSearchResultsOutputSchema>;

export async function refineSearchResults(input: RefineSearchResultsInput): Promise<RefineSearchResultsOutput> {
  return refineSearchResultsFlow(input);
}

const refineSearchResultsPrompt = ai.definePrompt({
  name: 'refineSearchResultsPrompt',
  input: {schema: RefineSearchResultsInputSchema},
  output: {schema: RefineSearchResultsOutputSchema},
  prompt: `You are an AI expert at filtering YouTube search results based on relevance.

The user searched for "{{query}}".  Here are the initial results:

{{#each results}}
---
Title: {{title}}
Description: {{description}}
View Count: {{viewCount}}
Like Count: {{likeCount}}
---
{{/each}}

Based on the title, view count, likes and content of each video, filter out any videos that are not relevant to the query.

Return a JSON array of only the relevant videos.
`,
});

const refineSearchResultsFlow = ai.defineFlow(
  {
    name: 'refineSearchResultsFlow',
    inputSchema: RefineSearchResultsInputSchema,
    outputSchema: RefineSearchResultsOutputSchema,
  },
  async input => {
    const {output} = await refineSearchResultsPrompt(input);
    return output!;
  }
);
