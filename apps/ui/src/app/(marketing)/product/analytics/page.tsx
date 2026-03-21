"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BarChart3, PieChart, TrendingUp, Target, FileBarChart, Cpu } from 'lucide-react';
const features = [
  { icon: BarChart3, title: 'Custom Dashboards', desc: 'Build unlimited dashboards with drag-and-drop widgets, charts, and real-time metrics.' },
  { icon: TrendingUp, title: 'Revenue Analytics', desc: 'Track ARR, MRR, churn, expansion, and net revenue retention in real-time.' },
  { icon: PieChart, title: 'Pipeline Insights', desc: 'Visual pipeline health, deal velocity, stage conversion rates, and bottleneck identification.' },
  { icon: Target, title: 'Team Performance', desc: 'Individual and team metrics, quota tracking, leaderboards, and activity reports.' },
  { icon: FileBarChart, title: 'Scheduled Reports', desc: 'Automated report generation and delivery via email, Slack, or webhooks.' },
  { icon: Cpu, title: 'AI Insights', desc: 'GPT-powered analysis that surfaces trends, anomalies, and actionable recommendations.' },
];
export default function ProductAnalyticsPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 text-sm font-medium text-teal-400 mb-6"><BarChart3 className="w-4 h-4" /> Analytics</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">See your revenue,<br />clearly</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">Real-time dashboards, AI insights, and automated reporting to drive data-informed decisions.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-teal-500/20 hover:scale-[1.02] transition-all">Try Analytics Free <ArrowRight className="w-4 h-4" /></Link>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
            <f.icon className="w-8 h-8 text-teal-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
