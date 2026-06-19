import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/marketing/seo';

export const metadata: Metadata = getPageMetadata('apiDocs');

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
