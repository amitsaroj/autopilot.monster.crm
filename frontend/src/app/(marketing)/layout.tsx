import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNavbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import { JsonLd } from '@/components/marketing/JsonLd';
import { SITE_URL, organizationJsonLd, webSiteJsonLd } from '@/lib/marketing/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f19] text-gray-900 dark:text-white selection:bg-indigo-500/30">
      <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
      <Link
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </Link>
      <MarketingNavbar />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
