"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Globe, Heart, Zap } from 'lucide-react';
const openings = [
  { title: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'AI/ML Engineer — Voice & NLP', team: 'AI', location: 'Remote', type: 'Full-time' },
  { title: 'Product Designer', team: 'Design', location: 'San Francisco', type: 'Full-time' },
  { title: 'Developer Advocate', team: 'Developer Relations', location: 'Remote', type: 'Full-time' },
  { title: 'GTM Lead — Enterprise', team: 'Sales', location: 'New York', type: 'Full-time' },
];
export default function CareersPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-5xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">Careers</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">Join the team<br />building the future</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">We're looking for exceptional people to help us build the AI Revenue OS.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: Sparkles, title: 'Innovation First', desc: 'Work on bleeding-edge AI, voice, and automation technology.' },
          { icon: Globe, title: 'Remote Culture', desc: 'Work from anywhere in the world. Results matter, not hours.' },
          { icon: Heart, title: 'Great Benefits', desc: 'Competitive equity, unlimited PTO, and health coverage.' },
          { icon: Zap, title: 'Ship Fast', desc: 'Small autonomous teams that ship weekly. No red tape.' },
        ].map((v, i) => (
          <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
            className="p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06]">
            <v.icon className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{v.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{v.desc}</p>
          </motion.div>
        ))}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Open Positions</h2>
      <div className="space-y-4">
        {openings.map((job, i) => (
          <motion.div key={job.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.5 }}>
            <Link href="/contact" className="group flex items-center justify-between p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-300 transition-colors">{job.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{job.team} · {job.location} · {job.type}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-gray-900 dark:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
