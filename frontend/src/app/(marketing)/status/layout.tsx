import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/marketing/seo';

export const metadata: Metadata = getPageMetadata('status');

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
