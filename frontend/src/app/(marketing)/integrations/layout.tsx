import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/marketing/seo';

export const metadata: Metadata = getPageMetadata('integrations');

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
