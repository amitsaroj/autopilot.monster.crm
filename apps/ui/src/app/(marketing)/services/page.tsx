"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Users, Sparkles, Phone, MessageSquare, GitBranch, BarChart3, Shield, CreditCard, Blocks, Database, Zap, Globe, Lock } from 'lucide-react';

const sections = [
  {
    tag: 'CRM',
    title: 'Intelligent CRM That Thinks',
    desc: 'AI-scored leads, drag-and-drop Kanban pipelines, 360° contact timelines, and predictive deal forecasting — all in one unified view.',
    icon: Users,
    color: 'from-blue-500 to-cyan-400',
    href: '/product/crm',
  },
  {
    tag: 'AI Agents',
    title: 'Autonomous AI That Sells',
    desc: 'Deploy GPT-powered agents that autonomously qualify leads, handle objections, book meetings, and nurture prospects 24/7.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-400',
    href: '/product/ai',
  },
  {
    tag: 'Voice AI',
    title: 'AI Voice Calling at Scale',
    desc: 'Sub-second latency conversational AI with real-time transcription, sentiment analysis, and automated follow-up triggers.',
    icon: Phone,
    color: 'from-orange-500 to-amber-400',
    href: '/product/voice',
  },
  {
    tag: 'WhatsApp OS',
    title: 'WhatsApp as a Revenue Channel',
    desc: 'Shared team inbox, broadcast campaigns, template management, and a visual no-code flow builder for automated conversations.',
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-400',
    href: '/product/whatsapp',
  },
  {
    tag: 'Workflows',
    title: 'Automation Without Code',
    desc: 'Drag-and-drop builder with triggers, conditions, delays, branches, and multi-channel actions that execute autonomously.',
    icon: GitBranch,
    color: 'from-indigo-500 to-violet-400',
    href: '/product/workflow',
  },
  {
    tag: 'Analytics',
    title: 'Revenue Intelligence',
    desc: 'Real-time ARR tracking, pipeline forecasting, custom dashboards, team performance, and AI-generated insights.',
    icon: BarChart3,
    color: 'from-teal-500 to-cyan-400',
    href: '/product/analytics',
  },
  {
    tag: 'Billing',
    title: 'Built-in SaaS Billing',
    desc: 'Subscription management, usage-based billing, invoice generation, payment processing, and credit wallets.',
    icon: CreditCard,
    color: 'from-pink-500 to-rose-400',
    href: '/product/billing',
  },
  {
    tag: 'Marketplace',
    title: 'Extend With Plugins',
    desc: 'Install community plugins, workflow templates, custom scripts, and third-party extensions from the marketplace.',
    icon: Blocks,
    color: 'from-yellow-500 to-orange-400',
    href: '/product/marketplace',
  },
  {
    tag: 'Security',
    title: 'Enterprise-Grade Security',
    desc: 'RBAC, JWT auth, audit logging, AES encryption, rate limiting, multi-tenant data isolation, and SOC 2 compliance.',
    icon: Shield,
    color: 'from-red-500 to-orange-400',
    href: '/security',
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">Platform Services</span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">
            Every tool your<br />revenue team needs
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            AutopilotMonster replaces your entire GTM stack with one unified AI-powered platform.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.tag}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <Link href={section.href} className="group block">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 p-8 rounded-2xl bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] hover:bg-white/[0.05] hover:border-gray-300 dark:border-white/[0.12] transition-all hover:-translate-y-0.5">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center shrink-0 shadow-xl shadow-black/20`}>
                    <section.icon className="w-8 h-8 text-gray-900 dark:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className={`text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${section.color} mb-1 block`}>
                      {section.tag}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-300 transition-colors">{section.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">{section.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-gray-900 dark:text-white group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
