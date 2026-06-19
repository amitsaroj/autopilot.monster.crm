import type { MetadataRoute } from 'next';
import { SITE_URL, marketingSitemapPaths } from '@/lib/marketing/seo';
import { blogPosts } from '@/lib/marketing/blog-posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages = marketingSitemapPaths.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency: (path === '/' || path === '/blog' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
    priority: path === '/' ? 1 : path === '/pricing' || path === '/features' ? 0.9 : 0.7,
  }));

  const blogPages = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
