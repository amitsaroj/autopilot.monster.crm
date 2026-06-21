import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/marketing/seo';

export const metadata: Metadata = getPageMetadata('testimonials');

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
