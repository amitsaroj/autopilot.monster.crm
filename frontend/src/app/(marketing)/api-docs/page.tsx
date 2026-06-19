"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Key, Webhook, Terminal } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

const sections = [
  {
    icon: Key,
    title: 'Authentication',
    desc: 'JWT bearer tokens via POST /auth/login. Include Authorization: Bearer <token> on tenant routes.',
  },
  {
    icon: Code2,
    title: 'REST API',
    desc: `Base URL: ${API_BASE}. Resources include /crm, /ai, /voice, /whatsapp, /billing, and /workflows.`,
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    desc: 'Stripe, Twilio, and Meta WhatsApp webhooks are exposed on public routes with signature verification.',
  },
  {
    icon: Terminal,
    title: 'SDKs & Guides',
    desc: 'TypeScript client patterns, rate limits, and pagination conventions in the developer docs.',
    href: '/docs',
  },
];

export default function ApiDocsPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">
            API Reference
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
            Developer API
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            Integrate AutopilotMonster with your stack using our REST API and webhooks.
          </p>
        </motion.div>

        <div className="space-y-6 mb-12">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06]"
            >
              <s.icon className="w-7 h-7 text-indigo-400 mb-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{s.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              {s.href && (
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-indigo-400 hover:gap-3 transition-all"
                >
                  Full documentation <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl bg-[#0b0f19] border border-white/10 p-6 font-mono text-sm text-gray-300 overflow-x-auto">
          <p className="text-gray-500 mb-2"># Example: list contacts</p>
          <pre>{`curl -H "Authorization: Bearer $TOKEN" \\
  ${API_BASE}/crm/contacts`}</pre>
        </div>
      </div>
    </div>
  );
}
