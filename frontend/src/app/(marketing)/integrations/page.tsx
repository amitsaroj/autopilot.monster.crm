"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Globe,
  Webhook,
  Code2,
  Blocks,
  Key,
  FileJson,
  Zap,
} from 'lucide-react';

const integrations = [
  { icon: Globe, title: 'REST API', desc: 'Full CRUD API for contacts, deals, workflows, and every platform resource.' },
  { icon: Webhook, title: 'Webhooks', desc: 'Real-time events for CRM changes, AI completions, and workflow triggers.' },
  { icon: Code2, title: 'TypeScript SDK', desc: 'Official SDK with full type safety for custom integrations.' },
  { icon: Blocks, title: '500+ Connectors', desc: 'Pre-built connectors for popular apps — no code required.' },
  { icon: Zap, title: 'n8n & Zapier', desc: 'Orchestrate workflows across 1,000+ apps with low-code automation.' },
  { icon: Key, title: 'OAuth & API Keys', desc: 'Secure authentication with OAuth 2.0, API keys, and service accounts.' },
  { icon: FileJson, title: 'GraphQL', desc: 'Flexible GraphQL endpoint for complex queries and custom data fetching.' },
];

const partnerLogos = [
  'Salesforce',
  'HubSpot',
  'Slack',
  'Stripe',
  'Twilio',
  'Shopify',
  'Google Workspace',
  'Microsoft 365',
];

export default function IntegrationsPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-sm font-medium text-cyan-400 mb-6">
            <Globe className="w-4 h-4" aria-hidden="true" /> Integrations
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">
            Connect
            <br />
            everything
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            APIs, webhooks, SDKs, and 500+ pre-built connectors to integrate AutopilotMonster with
            your entire stack.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl shadow-2xl shadow-cyan-500/20 hover:scale-[1.02] transition-all"
            >
              View API Docs <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/product/integrations"
              className="px-8 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/[0.08] hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-all"
            >
              Technical Overview
            </Link>
          </div>
        </motion.div>

        <div className="mb-20">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">
            Works with your favorite tools
          </h2>
          <ul className="flex flex-wrap justify-center gap-3" aria-label="Integration partners">
            {partnerLogos.map((name) => (
              <li
                key={name}
                className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-600 dark:text-gray-400"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all hover:border-gray-300 dark:hover:border-white/[0.12]"
            >
              <item.icon className="w-8 h-8 text-cyan-400 mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
