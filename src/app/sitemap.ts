
import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

const URL = 'https://www.tubeseek.msdharani.com';

type UserSearchData = Record<string, { searches: Record<string, { query: string }> }>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Add static pages
  const staticRoutes = [
    '',
    '/search',
    '/trending',
    '/music',
    '/news',
    '/kids',
    '/playlists',
    '/history',
    '/liked',
    '/subscriptions',
    '/settings',
    '/privacy-policy',
    '/login',
  ].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' || route === '/search' ? 1.0 : 0.8,
  }));

  // 2. Fetch and add dynamic search query pages
  let dynamicSearchRoutes: MetadataRoute.Sitemap = [];
  try {
    const searchesRef = ref(db, 'user-searches');
    const snapshot = await get(searchesRef);
    if (snapshot.exists()) {
      const allUserData: UserSearchData = snapshot.val();
      const uniqueQueries = new Set<string>();

      // Iterate over all users and their searches to collect unique queries
      for (const userId in allUserData) {
        const searches = allUserData[userId].searches;
        if (searches) {
          for (const searchId in searches) {
            const query = searches[searchId].query;
            if (query && query.trim()) {
              uniqueQueries.add(query.trim());
            }
          }
        }
      }

      dynamicSearchRoutes = Array.from(uniqueQueries).map((query) => ({
        url: `${URL}/search?q=${encodeURIComponent(query)}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch search queries for sitemap:', error);
    // Continue with just static routes if Firebase fails
  }
  
  return [...staticRoutes, ...dynamicSearchRoutes];
}
