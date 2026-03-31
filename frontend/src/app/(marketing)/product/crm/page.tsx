"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Users, Target, Columns3, Clock, BarChart3, Sparkles } from 'lucide-react';

const features = [
  { icon: Users, title: 'Contact Intelligence', desc: 'AI-scored 360° profiles with communication history, deal associations, and engagement tracking.' },
  { icon: Target, title: 'Lead Scoring', desc: 'Machine learning models that predict lead quality and prioritize your sales pipeline automatically.' },
  { icon: Columns3, title: 'Kanban Pipelines', desc: 'Drag-and-drop deal boards with automated stage transitions, weighted forecasting, and team assignments.' },
  { icon: Clock, title: 'Activity Timeline', desc: 'Every call, email, meeting, and touch point logged automatically in a unified chronological feed.' },
  { icon: BarChart3, title: 'Pipeline Forecasting', desc: 'AI-driven revenue projections with deal velocity metrics, win rate analysis, and risk identification.' },
  { icon: Sparkles, title: 'AI Copilot', desc: 'Get real-time suggestions on next best actions, optimal follow-up timing, and deal strategy recommendations.' },
];

export default function ProductCRMPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-sm font-medium text-blue-400 mb-6">
            <Users className="w-4 h-4" /> CRM Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">CRM that actually<br />closes deals</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">Not another database. A living, breathing AI-powered revenue system that learns, predicts, and acts.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-blue-500/20 hover:scale-[1.02] transition-all">
            Try CRM Free <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
              <f.icon className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
