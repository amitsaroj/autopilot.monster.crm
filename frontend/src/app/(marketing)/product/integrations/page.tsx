"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Globe, Webhook, Code2, Blocks, Key, FileJson } from 'lucide-react';
const features = [
  { icon: Globe, title: 'REST API', desc: 'Full CRUD API for every resource — contacts, deals, workflows, and more.' },
  { icon: Webhook, title: 'Webhooks', desc: 'Real-time event webhooks for CRM changes, AI completions, and workflow triggers.' },
  { icon: Code2, title: 'TypeScript SDK', desc: 'Official SDK for building custom integrations with full type safety.' },
  { icon: Blocks, title: 'Zapier-Style Connectors', desc: 'Pre-built connectors for 500+ apps without writing a single line of code.' },
  { icon: Key, title: 'OAuth & API Keys', desc: 'Secure authentication with OAuth 2.0, API keys, and service accounts.' },
  { icon: FileJson, title: 'GraphQL', desc: 'Flexible GraphQL endpoint for complex queries and custom data fetching.' },
];
export default function ProductIntegrationsPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-sm font-medium text-cyan-400 mb-6"><Globe className="w-4 h-4" /> Integrations</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">Connect<br />everything</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">APIs, webhooks, SDKs, and 500+ pre-built connectors to integrate with your entire stack.</p>
        <Link href="/docs" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-cyan-500/20 hover:scale-[1.02] transition-all">View API Docs <ArrowRight className="w-4 h-4" /></Link>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
            <f.icon className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
