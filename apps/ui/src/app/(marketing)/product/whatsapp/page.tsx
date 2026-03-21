"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MessageSquare, Send, Layout, GitBranch as Flow, BarChart3, Users } from 'lucide-react';
const features = [
  { icon: Users, title: 'Shared Team Inbox', desc: 'All WhatsApp conversations unified in one inbox with agent assignment and AI takeover.' },
  { icon: Send, title: 'Broadcast Campaigns', desc: 'Send template-approved broadcast messages to thousands of contacts with segmentation.' },
  { icon: Layout, title: 'Template Manager', desc: 'Create, manage, and track Meta-approved message templates with rich media support.' },
  { icon: Flow, title: 'Visual Flow Builder', desc: 'No-code drag-and-drop builder to design WhatsApp bot flows with conditions and branches.' },
  { icon: BarChart3, title: 'Campaign Analytics', desc: 'Track delivery, open, reply rates, and ROI across all your WhatsApp campaigns.' },
  { icon: MessageSquare, title: 'AI Auto-Response', desc: 'AI agents that respond to customer queries, qualify leads, and hand off to humans seamlessly.' },
];
export default function ProductWhatsAppPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-sm font-medium text-green-400 mb-6"><MessageSquare className="w-4 h-4" /> WhatsApp OS</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">WhatsApp as a<br />revenue channel</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">Turn WhatsApp into your highest-converting sales channel with AI automation and team collaboration.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-green-500/20 hover:scale-[1.02] transition-all">Try WhatsApp Free <ArrowRight className="w-4 h-4" /></Link>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
            <f.icon className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
