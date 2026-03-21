"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, Phone, MessageSquare, GitBranch, BarChart3, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }),
};

const features = [
  { icon: Users, title: 'Smart CRM', desc: 'AI-scored leads, drag-and-drop pipelines, and 360° contact intelligence.', color: 'from-blue-500 to-cyan-400' },
  { icon: Sparkles, title: 'AI Agents', desc: 'Autonomous GPT-powered agents that qualify, nurture, and close deals 24/7.', color: 'from-purple-500 to-pink-400' },
  { icon: Phone, title: 'Voice AI', desc: 'Sub-second latency AI calling with real-time transcription and sentiment analysis.', color: 'from-orange-500 to-amber-400' },
  { icon: MessageSquare, title: 'WhatsApp OS', desc: 'Shared team inbox, broadcast campaigns, and visual no-code flow builder.', color: 'from-green-500 to-emerald-400' },
  { icon: GitBranch, title: 'Workflow Engine', desc: 'Drag-and-drop automation with triggers, conditions, delays, and multi-channel actions.', color: 'from-indigo-500 to-violet-400' },
  { icon: BarChart3, title: 'Revenue Analytics', desc: 'Real-time ARR tracking, pipeline forecasting, and AI-driven revenue insights.', color: 'from-teal-500 to-cyan-400' },
];

export default function HomePage() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/8 dark:bg-purple-600/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          
          {/* Badge */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] text-sm font-medium text-gray-600 dark:text-gray-400 mb-8 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Now in Public Beta — AI Voice Calling is live
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            <span className="text-gray-900 dark:text-white">Your AI-Powered</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400">
              Revenue Engine
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp}
            className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AutopilotMonster unifies CRM, AI Agents, Voice Calling, WhatsApp, and Workflow Automation into one autonomous platform that sells, supports, and scales — on autopilot.
          </motion.p>

          {/* CTAs */}
          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="group px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/services"
              className="px-8 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/[0.08] hover:bg-gray-200 dark:hover:bg-white/[0.08] hover:text-gray-900 dark:hover:text-white transition-all backdrop-blur-sm">
              Watch Demo
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}
            className="mt-16 flex flex-col items-center gap-4">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0b0f19] bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Trusted by <span className="text-gray-900 dark:text-white font-semibold">2,400+</span> revenue teams worldwide
            </p>
          </motion.div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white dark:from-[#0b0f19] to-transparent z-20" />
      </section>

      {/* ========== FEATURES GRID ========== */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-4 block">Everything You Need</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">One Platform.<br />Infinite Automation.</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Replace 10 disconnected tools with one unified AI OS that works together seamlessly.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-8 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-600/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">Ready to put revenue<br />on autopilot?</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto">Join thousands of teams using AutopilotMonster to close more deals, faster — with AI doing the heavy lifting.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="group px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] flex items-center gap-2">
                Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pricing" className="px-8 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/[0.08] hover:bg-gray-200 dark:hover:bg-white/[0.08] hover:text-gray-900 dark:hover:text-white transition-all backdrop-blur-sm">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
