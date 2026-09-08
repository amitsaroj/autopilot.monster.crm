import { JsonLd } from '@/components/marketing/JsonLd';
import HomePageContent from '@/components/marketing/pages/HomePageContent';
import {
  getPageMetadata,
  softwareApplicationJsonLd,
  organizationJsonLd,
} from '@/lib/marketing/seo';

export const metadata = getPageMetadata('home');

// Server-rendered intro content to ensure crawlers see meaningful HTML
function ServerRenderedIntro() {
  return (
    <section aria-labelledby="server-hero" className="prose mx-auto px-6 py-8 max-w-4xl">
      <h1 id="server-hero">AutopilotMonster — AI Revenue Automation</h1>
      <p>
        AutopilotMonster unifies CRM, autonomous AI agents, voice calling, WhatsApp, and
        workflow automation into a single AI-native platform that helps revenue teams acquire,
        qualify, and close leads faster. Our platform integrates real-time voice AI, automated
        follow-ups, multi-channel orchestration, and analytics to convert prospects at scale. For
        developers and integrators we publish machine-readable API docs, OpenAPI specifications,
        and discoverability metadata so automated agents and crawlers can connect programmatically.
      </p>
      <p>
        Use the published developer resources to explore REST endpoints, obtain scoped OAuth
        permissions, and try our sandbox. Read the API reference at /openapi.json and the
        developer portal at /api-docs for authentication, examples, and rate limits.
      </p>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareApplicationJsonLd()} />
      <JsonLd data={organizationJsonLd()} />
      <ServerRenderedIntro />
      <HomePageContent />
    </>
  );
}
