
import { z } from 'zod';

export const YoutubeSearchResponseSchema = z.object({
  items: z.array(z.object({
    id: z.object({
      videoId: z.string(),
    }),
    snippet: z.object({
      title: z.string(),
      description: z.string(),
      thumbnails: z.object({
        high: z.object({
          url: z.string(),
        }),
      }),
    }),
  })),
});

export const YoutubeVideosResponseSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    snippet: z.object({
        title: z.string(),
        description: z.string(),
        publishedAt: z.string(),
        channelTitle: z.string(),
        thumbnails: z.object({
            high: z.object({
              url: z.string(),
            }),
          }),
    }),
    contentDetails: z.object({
      duration: z.string(),
    }),
    statistics: z.object({
      viewCount: z.string().optional().default("0"),
      likeCount: z.string().optional().default("0"),
    }),
  })),
});

const SearchResultSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  duration: z.string(),
  viewCount: z.string(),
  likeCount: z.string(),
  publishedAt: z.string(),
  channelTitle: z.string(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;


const SearchQuerySchema = z.object({
  query: z.string(),
  resultsCount: z.number(),
  timestamp: z.string(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;


export const UserInfoSchema = z.object({
  uid: z.string(),
  email: z.string().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().nullable(),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;
