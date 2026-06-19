import { JsonLd } from '@/components/marketing/JsonLd';
import HomePageContent from '@/components/marketing/pages/HomePageContent';
import {
  getPageMetadata,
  softwareApplicationJsonLd,
} from '@/lib/marketing/seo';

export const metadata = getPageMetadata('home');

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareApplicationJsonLd()} />
      <HomePageContent />
    </>
  );
}
