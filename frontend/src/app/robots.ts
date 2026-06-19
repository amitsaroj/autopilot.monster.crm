import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/marketing/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/superadmin/',
          '/api/',
          '/login',
          '/register',
          '/onboarding',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
