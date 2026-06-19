import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/marketing/seo';

export const metadata: Metadata = getPageMetadata('help');

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
