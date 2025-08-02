
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
});

export type SearchResult = z.infer<typeof SearchResultSchema>;
