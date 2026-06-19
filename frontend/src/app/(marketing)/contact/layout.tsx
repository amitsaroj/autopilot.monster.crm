import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/marketing/seo';

export const metadata: Metadata = getPageMetadata('contact');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
