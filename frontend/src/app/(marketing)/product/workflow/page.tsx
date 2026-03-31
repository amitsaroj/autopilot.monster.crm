"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, GitBranch, Zap, Clock, Split, Play, BarChart3 } from 'lucide-react';
const features = [
  { icon: GitBranch, title: 'Visual Builder', desc: 'Drag-and-drop interface to design complex automations without writing code.' },
  { icon: Zap, title: 'Event Triggers', desc: 'Trigger workflows from CRM events, webhooks, schedule, or manual activation.' },
  { icon: Split, title: 'Smart Branching', desc: 'If/else conditions, lead score thresholds, and A/B split testing built in.' },
  { icon: Clock, title: 'Delays & Scheduling', desc: 'Time-based delays, business hours, and timezone-aware scheduling.' },
  { icon: Play, title: 'Multi-Channel Actions', desc: 'Send emails, WhatsApp, SMS, voice calls, Slack alerts, or webhook POSTs.' },
  { icon: BarChart3, title: 'Workflow Analytics', desc: 'Track execution rates, failure points, and optimize automation performance.' },
];
export default function ProductWorkflowPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-sm font-medium text-violet-400 mb-6"><GitBranch className="w-4 h-4" /> Workflow Engine</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">Automation<br />without limits</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">Build powerful multi-step automations that connect your entire revenue stack visually.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] transition-all">Try Workflows Free <ArrowRight className="w-4 h-4" /></Link>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
            <f.icon className="w-8 h-8 text-violet-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
