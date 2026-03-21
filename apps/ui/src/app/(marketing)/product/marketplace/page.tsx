"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Blocks, Puzzle, GitBranch, Code2, FileCode, Store } from 'lucide-react';
const features = [
  { icon: Puzzle, title: 'Plugins', desc: 'Install community-built plugins that extend CRM, AI, and automation capabilities.' },
  { icon: GitBranch, title: 'Workflow Templates', desc: 'Pre-built automation templates for common use cases — deploy in one click.' },
  { icon: Code2, title: 'Custom Scripts', desc: 'Write and share custom JavaScript scripts that run inside workflow actions.' },
  { icon: FileCode, title: 'Extensions SDK', desc: 'Build your own integrations using our TypeScript SDK and publish to the marketplace.' },
  { icon: Store, title: 'Vendor Ecosystem', desc: 'Browse verified vendors, read reviews, and install with confidence.' },
  { icon: Blocks, title: 'Private Plugins', desc: 'Build and deploy private plugins for your organization only.' },
];
export default function ProductMarketplacePage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-sm font-medium text-yellow-400 mb-6"><Blocks className="w-4 h-4" /> Marketplace</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">Extend<br />everything</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">Discover plugins, templates, and extensions built by the AutopilotMonster community.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-yellow-500/20 hover:scale-[1.02] transition-all">Explore Marketplace <ArrowRight className="w-4 h-4" /></Link>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
            <f.icon className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
