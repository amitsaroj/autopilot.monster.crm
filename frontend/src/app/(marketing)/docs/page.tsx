"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Book, Code2, Zap, FileText, Terminal, Globe } from 'lucide-react';
const sections = [
  { icon: Zap, title: 'Quick Start', desc: 'Get up and running in 5 minutes with our step-by-step guides.', href: '/docs' },
  { icon: Code2, title: 'API Reference', desc: 'Complete REST and GraphQL API documentation with examples.', href: '/docs' },
  { icon: Terminal, title: 'SDKs', desc: 'Official TypeScript, Python, and Go SDKs for building integrations.', href: '/docs' },
  { icon: FileText, title: 'Guides', desc: 'In-depth tutorials for CRM, AI agents, voice, and workflow setup.', href: '/docs' },
  { icon: Globe, title: 'Webhooks', desc: 'Complete webhook reference with event types and payload schemas.', href: '/docs' },
  { icon: Book, title: 'Changelog', desc: 'Stay updated with the latest platform releases and improvements.', href: '/blog' },
];
export default function DocsPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">Documentation</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">Build with<br />AutopilotMonster</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Everything you need to integrate, customize, and extend the platform.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
            <Link href={s.href} className="group block p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12] hover:-translate-y-1 h-full">
              <s.icon className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">{s.desc}</p>
              <span className="text-indigo-400 text-sm font-medium flex items-center gap-1.5 group-hover:gap-3 transition-all">Read more <ArrowRight className="w-4 h-4" /></span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
