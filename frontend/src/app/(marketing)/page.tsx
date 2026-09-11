import { JsonLd } from '@/components/marketing/JsonLd';
import HomePageContent from '@/components/marketing/pages/HomePageContent';
import {
  getPageMetadata,
  softwareApplicationJsonLd,
  organizationJsonLd,
} from '@/lib/marketing/seo';

export const metadata = getPageMetadata('home');

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareApplicationJsonLd()} />
      <JsonLd data={organizationJsonLd()} />
      <HomePageContent />
    </>
  );
}
