"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Globe, Target, Heart } from 'lucide-react';
const values = [
  { icon: Zap, title: 'Speed', desc: 'We ship fast and iterate relentlessly. Every week brings new capabilities.' },
  { icon: Globe, title: 'Global Scale', desc: 'Built for enterprise from day one — multi-tenant, multi-region, multi-language.' },
  { icon: Target, title: 'Customer Obsessed', desc: 'Every feature starts with a customer problem. We build what matters.' },
  { icon: Heart, title: 'Open Ecosystem', desc: 'APIs, SDKs, and integrations — we believe in interoperability over lock-in.' },
];
export default function AboutPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-5xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">About Us</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">We're building the future<br />of revenue automation</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">AutopilotMonster is an AI-native platform that unifies CRM, Voice, WhatsApp, and Workflow Automation into a single autonomous revenue engine.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-10 mb-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg">To democratize AI-powered revenue operations so that every business — from startups to enterprises — can sell, support, and scale with intelligent automation. We believe the future of GTM is autonomous, and we're building the OS to make it happen.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {values.map((v, i) => (
          <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06]">
            <v.icon className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{v.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
