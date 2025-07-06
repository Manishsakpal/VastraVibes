
import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/superAdmin/'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
