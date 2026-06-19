import type { Metadata } from 'next';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://autopilotmonster.com';

export const SITE_NAME = 'AutopilotMonster CRM';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export type PageSeoConfig = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
}: PageSeoConfig): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName: SITE_NAME,
      title: `${title} | AutopilotMonster`,
      description,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | AutopilotMonster`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export const marketingPages = {
  home: {
    title: 'AI-Powered Revenue Engine',
    description:
      'AutopilotMonster unifies CRM, AI Agents, Voice Calling, WhatsApp, and Workflow Automation into one autonomous platform for modern revenue teams.',
    path: '/',
    keywords: [
      'AI CRM',
      'revenue automation',
      'voice AI',
      'WhatsApp CRM',
      'sales automation',
    ],
  },
  features: {
    title: 'Platform Features',
    description:
      'Explore AutopilotMonster features: smart CRM, AI agents, voice calling, WhatsApp OS, workflows, analytics, billing, and marketplace integrations.',
    path: '/features',
    keywords: ['CRM features', 'AI sales', 'workflow automation', 'voice AI CRM'],
  },
  pricing: {
    title: 'Pricing',
    description:
      'Simple, transparent pricing for AutopilotMonster. Start free, scale with Growth, or contact us for Enterprise plans.',
    path: '/pricing',
    keywords: ['CRM pricing', 'AI CRM plans', 'SaaS pricing'],
  },
  integrations: {
    title: 'Integrations',
    description:
      'Connect AutopilotMonster to your stack with REST APIs, webhooks, GraphQL, SDKs, and 500+ pre-built connectors.',
    path: '/integrations',
    keywords: ['CRM integrations', 'API', 'webhooks', 'Zapier', 'n8n'],
  },
  testimonials: {
    title: 'Customer Testimonials',
    description:
      'See how revenue teams use AutopilotMonster to close more deals with AI-powered CRM, voice, and WhatsApp automation.',
    path: '/testimonials',
    keywords: ['CRM reviews', 'customer stories', 'AI CRM testimonials'],
  },
  services: {
    title: 'Platform Services',
    description:
      'Every tool your revenue team needs — CRM, AI, voice, WhatsApp, workflows, analytics, billing, and more in one platform.',
    path: '/services',
  },
  product: {
    title: 'Product Overview',
    description:
      'The complete revenue platform — CRM, AI agents, voice AI, WhatsApp, workflows, and analytics unified in one AI-native OS.',
    path: '/product',
  },
  productCrm: {
    title: 'Smart CRM',
    description:
      'AI-scored leads, drag-and-drop pipelines, and 360° contact intelligence with AutopilotMonster CRM.',
    path: '/product/crm',
  },
  productAi: {
    title: 'AI Agents',
    description:
      'Deploy autonomous GPT-powered agents that qualify leads, nurture prospects, and close deals 24/7.',
    path: '/product/ai',
  },
  productVoice: {
    title: 'Voice AI',
    description:
      'Sub-second latency AI voice calling with real-time transcription, sentiment analysis, and automated follow-ups.',
    path: '/product/voice',
  },
  productWhatsapp: {
    title: 'WhatsApp OS',
    description:
      'Shared team inbox, broadcast campaigns, templates, and visual no-code WhatsApp automation.',
    path: '/product/whatsapp',
  },
  productWorkflow: {
    title: 'Workflow Engine',
    description:
      'Drag-and-drop automation with triggers, conditions, delays, and multi-channel actions.',
    path: '/product/workflow',
  },
  productAnalytics: {
    title: 'Revenue Analytics',
    description:
      'Real-time ARR tracking, pipeline forecasting, custom dashboards, and AI-driven revenue insights.',
    path: '/product/analytics',
  },
  productMarketplace: {
    title: 'Marketplace',
    description:
      'Extend AutopilotMonster with plugins, workflow templates, and third-party integrations.',
    path: '/product/marketplace',
  },
  productBilling: {
    title: 'SaaS Billing',
    description:
      'Built-in subscription management, usage-based billing, invoices, and credit wallets.',
    path: '/product/billing',
  },
  productIntegrations: {
    title: 'Integrations & APIs',
    description:
      'REST API, GraphQL, webhooks, TypeScript SDK, and 500+ connectors for your entire stack.',
    path: '/product/integrations',
  },
  about: {
    title: 'About Us',
    description:
      'AutopilotMonster is building the AI-native revenue OS — unifying CRM, voice, WhatsApp, and workflow automation.',
    path: '/about',
  },
  blog: {
    title: 'Blog',
    description:
      'Product updates, engineering deep dives, and revenue automation best practices from AutopilotMonster.',
    path: '/blog',
  },
  contact: {
    title: 'Contact',
    description:
      'Contact AutopilotMonster for pricing, enterprise features, partnerships, and custom demos.',
    path: '/contact',
  },
  demo: {
    title: 'Demo Access',
    description:
      'Explore AutopilotMonster with pre-seeded demo accounts for every role — SuperAdmin, Admin, Manager, User, and Agent.',
    path: '/demo',
  },
  careers: {
    title: 'Careers',
    description:
      'Join AutopilotMonster and help build the future of AI-powered revenue automation.',
    path: '/careers',
  },
  partners: {
    title: 'Partners',
    description:
      'Partner with AutopilotMonster to deliver AI CRM, voice, and automation solutions to your clients.',
    path: '/partners',
  },
  docs: {
    title: 'Documentation',
    description:
      'API reference, SDKs, guides, and webhooks documentation for building on AutopilotMonster.',
    path: '/docs',
  },
  security: {
    title: 'Security',
    description:
      'Enterprise-grade security — RBAC, encryption, audit logging, multi-tenant isolation, and SOC 2 compliance.',
    path: '/security',
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'How AutopilotMonster collects, uses, and protects your personal data.',
    path: '/privacy',
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms and conditions for using the AutopilotMonster platform.',
    path: '/terms',
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'How AutopilotMonster uses cookies and similar technologies.',
    path: '/cookies',
  },
  sla: {
    title: 'Service Level Agreement',
    description: 'AutopilotMonster uptime commitments and support response times.',
    path: '/sla',
  },
  help: {
    title: 'Help Center',
    description:
      'Get help with AutopilotMonster — onboarding guides, billing support, integrations, and troubleshooting.',
    path: '/help',
    keywords: ['CRM help', 'support', 'onboarding', 'troubleshooting'],
  },
  status: {
    title: 'System Status',
    description:
      'Live platform status for AutopilotMonster API, voice, WhatsApp, and core services.',
    path: '/status',
    keywords: ['status page', 'uptime', 'incidents', 'API health'],
  },
  apiDocs: {
    title: 'API Documentation',
    description:
      'REST API reference, authentication, webhooks, and SDK guides for AutopilotMonster developers.',
    path: '/api-docs',
    keywords: ['API docs', 'REST API', 'webhooks', 'developer'],
  },
} as const satisfies Record<string, PageSeoConfig>;

export function getPageMetadata(key: keyof typeof marketingPages): Metadata {
  return buildPageMetadata(marketingPages[key]);
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AutopilotMonster',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: marketingPages.home.description,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@autopilotmonster.com',
      contactType: 'customer support',
    },
    sameAs: [
      'https://twitter.com/autopilotcrm',
      'https://www.linkedin.com/company/autopilotmonster',
      'https://github.com/autopilotmonster',
      'https://www.youtube.com/@autopilotmonster',
    ],
  };
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '49',
      priceCurrency: 'USD',
    },
    description: marketingPages.home.description,
    url: SITE_URL,
  };
}

export function pricingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'AutopilotMonster CRM',
    description: marketingPages.pricing.description,
    brand: { '@type': 'Brand', name: 'AutopilotMonster' },
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '49',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Growth',
        price: '199',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing`,
      },
    ],
  };
}

export function testimonialsJsonLd(
  items: Array<{ name: string; role: string; company: string; quote: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: item.name,
          jobTitle: item.role,
          worksFor: { '@type': 'Organization', name: item.company },
        },
        reviewBody: item.quote,
        itemReviewed: {
          '@type': 'SoftwareApplication',
          name: SITE_NAME,
        },
      },
    })),
  };
}

export const marketingSitemapPaths = Object.values(marketingPages).map(
  (page) => page.path,
);
