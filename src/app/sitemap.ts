
import { getItemsFromDb } from '@/lib/data-service';
import { processRawItems } from '@/lib/utils';
import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawItems = await getItemsFromDb();
  const items = processRawItems(rawItems);

  const productEntries: MetadataRoute.Sitemap = items.map(item => ({
    url: `${appUrl}/item/${item.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${appUrl}/track`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...productEntries,
  ];
}
