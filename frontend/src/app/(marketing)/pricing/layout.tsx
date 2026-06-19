import type { Metadata } from 'next';
import { JsonLd } from '@/components/marketing/JsonLd';
import { getPageMetadata, pricingJsonLd } from '@/lib/marketing/seo';

export const metadata: Metadata = getPageMetadata('pricing');

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={pricingJsonLd()} />
      {children}
    </>
  );
}
