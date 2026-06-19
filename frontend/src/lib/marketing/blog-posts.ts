export type BlogPost = {
  slug: string;
  title: string;
  tag: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'ai-voice-agents-replacing-sdr-teams',
    title: 'How AI Voice Agents Are Replacing SDR Teams',
    tag: 'AI',
    date: 'Oct 12, 2024',
    readTime: '8 min read',
    excerpt:
      'Explore how sub-second latency AI calling is transforming outbound sales and why traditional SDR models are becoming obsolete.',
    content: [
      'Outbound sales is undergoing its biggest shift in a decade. AI voice agents now handle first-touch calls with natural conversation, real-time objection handling, and instant CRM logging.',
      'Teams using AutopilotMonster Voice AI report 3x more qualified meetings booked per rep, with agents operating 24/7 across time zones without burnout.',
      'The key is sub-second latency — prospects cannot tell they are speaking with AI until the agent seamlessly hands off to a human closer when intent is detected.',
    ],
  },
  {
    slug: 'multi-tenant-saas-nestjs-typeorm',
    title: 'Building a Multi-Tenant SaaS with NestJS and TypeORM',
    tag: 'Engineering',
    date: 'Oct 05, 2024',
    readTime: '12 min read',
    excerpt:
      'A deep dive into our architecture decisions for tenant isolation, row-level security, and scalable microservices.',
    content: [
      'Multi-tenancy is the foundation of AutopilotMonster. Every API request carries tenant context, enforced at the database layer with row-level isolation.',
      'We chose NestJS for modular domain boundaries and TypeORM for entity-driven migrations across 76+ tables.',
      'This architecture lets us ship features once and deploy to thousands of tenants with zero cross-tenant data leakage.',
    ],
  },
  {
    slug: 'whatsapp-automation-ecommerce-roi',
    title: 'The ROI of WhatsApp Automation for E-commerce',
    tag: 'WhatsApp',
    date: 'Sep 28, 2024',
    readTime: '6 min read',
    excerpt:
      'Case study: How our customers achieved 340% ROI using WhatsApp broadcast campaigns and AI-powered flows.',
    content: [
      'E-commerce brands lose revenue when cart abandonment emails go unread. WhatsApp messages see 98% open rates within minutes.',
      'AutopilotMonster customers build visual flows that trigger on cart events, send personalized offers, and escalate to human agents when needed.',
      'One mid-market retailer recovered $2.1M in abandoned cart revenue in a single quarter using automated WhatsApp sequences.',
    ],
  },
  {
    slug: 'rag-powered-knowledge-bases-guide',
    title: 'RAG-Powered Knowledge Bases: A Technical Guide',
    tag: 'AI',
    date: 'Sep 20, 2024',
    readTime: '10 min read',
    excerpt:
      'How we built a production RAG system with Qdrant, OpenAI embeddings, and intelligent chunking strategies.',
    content: [
      'Retrieval-augmented generation powers AutopilotMonster AI agents with accurate, up-to-date answers from your knowledge base.',
      'We chunk documents intelligently by semantic boundaries, embed with OpenAI, and store vectors in Qdrant for sub-100ms retrieval.',
      'Agents cite sources in responses, giving sales and support teams confidence in AI-generated answers.',
    ],
  },
  {
    slug: 'workflow-automation-revenue-teams',
    title: 'Workflow Automation Best Practices for Revenue Teams',
    tag: 'Workflows',
    date: 'Sep 15, 2024',
    readTime: '7 min read',
    excerpt:
      'The top 10 automation patterns that high-performing revenue teams use to close more deals.',
    content: [
      'The best revenue teams automate repetitive work: lead routing, follow-up sequences, deal stage updates, and meeting reminders.',
      'Start with high-volume triggers — form submissions, call outcomes, and email replies — then layer conditions based on lead score and pipeline stage.',
      'AutopilotMonster workflows connect CRM, voice, WhatsApp, and email in a single visual builder with no code required.',
    ],
  },
  {
    slug: 'autopilotmonster-v2-whats-new',
    title: "AutopilotMonster v2.0: What's New",
    tag: 'Product',
    date: 'Sep 01, 2024',
    readTime: '5 min read',
    excerpt:
      'Introducing AI Copilot, advanced pipeline forecasting, and the new visual workflow builder.',
    content: [
      'AutopilotMonster v2.0 brings AI Copilot to every screen — draft emails, summarize calls, and suggest next best actions in one click.',
      'Pipeline forecasting now uses historical win rates and AI predictions to project revenue with confidence intervals.',
      'The redesigned workflow builder supports branching, delays, and multi-channel actions in a drag-and-drop canvas.',
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
