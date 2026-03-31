"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Sparkles, Phone, MessageSquare, GitBranch, BarChart3, ArrowRight } from 'lucide-react';

const products = [
  { icon: Users, title: 'Smart CRM', desc: 'AI-scored leads, drag-and-drop Kanban pipelines, and 360° contact intelligence.', color: 'from-blue-500 to-cyan-400', href: '/product/crm' },
  { icon: Sparkles, title: 'AI Agents', desc: 'Autonomous GPT copilots that qualify, nurture, and close deals on autopilot.', color: 'from-purple-500 to-pink-400', href: '/product/ai' },
  { icon: Phone, title: 'Voice AI', desc: 'AI-powered calling with real-time transcription and automated call workflows.', color: 'from-orange-500 to-amber-400', href: '/product/voice' },
  { icon: MessageSquare, title: 'WhatsApp OS', desc: 'Team inbox, broadcast, templates, and visual no-code automation builder.', color: 'from-green-500 to-emerald-400', href: '/product/whatsapp' },
  { icon: GitBranch, title: 'Workflow Engine', desc: 'Visual drag-and-drop automation with triggers, conditions, and multi-channel actions.', color: 'from-indigo-500 to-violet-400', href: '/product/workflow' },
  { icon: BarChart3, title: 'Analytics', desc: 'Revenue insights, custom dashboards, and AI-generated performance reports.', color: 'from-teal-500 to-cyan-400', href: '/product/analytics' },
];

export default function ProductPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">Product</span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">The Complete<br />Revenue Platform</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Everything your GTM team needs, unified into one AI-native operating system.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
              <Link href={p.href} className="group block p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12] hover:-translate-y-1 h-full">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-6 shadow-xl shadow-black/20`}>
                  <p.icon className="w-7 h-7 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{p.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{p.desc}</p>
                <span className="text-indigo-400 text-sm font-medium flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
