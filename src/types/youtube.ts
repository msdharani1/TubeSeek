
import { z } from 'zod';

export const YoutubeSearchResponseSchema = z.object({
  items: z.array(z.object({
    id: z.object({
      videoId: z.string(),
    }),
    snippet: z.object({
      title: z.string(),
      description: z.string(),
      channelId: z.string(),
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
        channelId: z.string(),
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
  channelId: z.string(),
  channelTitle: z.string(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;


const SearchQuerySchema = z.object({
  id: z.string().optional(), // Adding optional ID for keying in lists
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


const WatchedVideoSchema = SearchResultSchema.extend({
    id: z.string(),
    watchedAt: z.number(),
    durationSeconds: z.number().optional(),
    progressSeconds: z.number().optional(),
});

export type WatchedVideo = z.infer<typeof WatchedVideoSchema>;

export const PlaylistItemSchema = SearchResultSchema.extend({
  id: z.string(), // Unique key for the playlist item in Firebase
  addedAt: z.number(),
});
export type PlaylistItem = z.infer<typeof PlaylistItemSchema>;

export const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  videoCount: z.number().default(0),
  thumbnail: z.string().optional(),
  createdAt: z.number(),
});
export type Playlist = z.infer<typeof PlaylistSchema>;

export const LikedVideoSchema = SearchResultSchema.extend({
  likedAt: z.number(),
});
export type LikedVideo = z.infer<typeof LikedVideoSchema>;

export const SubscriptionSchema = z.object({
  channelId: z.string(),
  channelTitle: z.string(),
  subscribedAt: z.number(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export type FilterOptions = {
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
  videoDuration?: 'any' | 'long' | 'medium' | 'short';
};
