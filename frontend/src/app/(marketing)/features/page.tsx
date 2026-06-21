"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Users,
  Sparkles,
  Phone,
  MessageSquare,
  GitBranch,
  BarChart3,
  Shield,
  CreditCard,
  Blocks,
  Globe,
} from 'lucide-react';

const featureSections = [
  {
    tag: 'CRM',
    title: 'Intelligent CRM That Thinks',
    desc: 'AI-scored leads, drag-and-drop Kanban pipelines, 360° contact timelines, and predictive deal forecasting.',
    icon: Users,
    color: 'from-blue-500 to-cyan-400',
    href: '/product/crm',
  },
  {
    tag: 'AI Agents',
    title: 'Autonomous AI That Sells',
    desc: 'Deploy GPT-powered agents that qualify leads, handle objections, book meetings, and nurture prospects 24/7.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-400',
    href: '/product/ai',
  },
  {
    tag: 'Voice AI',
    title: 'AI Voice Calling at Scale',
    desc: 'Sub-second latency conversational AI with real-time transcription, sentiment analysis, and bulk outbound campaigns.',
    icon: Phone,
    color: 'from-orange-500 to-amber-400',
    href: '/product/voice',
  },
  {
    tag: 'WhatsApp OS',
    title: 'WhatsApp as a Revenue Channel',
    desc: 'Shared team inbox, broadcast campaigns, template management, and visual no-code flow builder.',
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-400',
    href: '/product/whatsapp',
  },
  {
    tag: 'Workflows',
    title: 'Automation Without Code',
    desc: 'Drag-and-drop builder with triggers, conditions, delays, branches, and multi-channel actions.',
    icon: GitBranch,
    color: 'from-indigo-500 to-violet-400',
    href: '/product/workflow',
  },
  {
    tag: 'Analytics',
    title: 'Revenue Intelligence',
    desc: 'Real-time ARR tracking, pipeline forecasting, custom dashboards, and AI-generated insights.',
    icon: BarChart3,
    color: 'from-teal-500 to-cyan-400',
    href: '/product/analytics',
  },
  {
    tag: 'Billing',
    title: 'Built-in SaaS Billing',
    desc: 'Subscription management, usage-based billing, invoice generation, and credit wallets.',
    icon: CreditCard,
    color: 'from-pink-500 to-rose-400',
    href: '/product/billing',
  },
  {
    tag: 'Marketplace',
    title: 'Extend With Plugins',
    desc: 'Install community plugins, workflow templates, and third-party extensions.',
    icon: Blocks,
    color: 'from-yellow-500 to-orange-400',
    href: '/product/marketplace',
  },
  {
    tag: 'Integrations',
    title: 'Connect Your Stack',
    desc: 'REST API, GraphQL, webhooks, SDKs, and 500+ pre-built connectors including n8n and Zapier.',
    icon: Globe,
    color: 'from-cyan-500 to-blue-400',
    href: '/integrations',
  },
  {
    tag: 'Security',
    title: 'Enterprise-Grade Security',
    desc: 'RBAC, JWT auth, audit logging, AES encryption, rate limiting, and multi-tenant data isolation.',
    icon: Shield,
    color: 'from-red-500 to-orange-400',
    href: '/security',
  },
];

export default function FeaturesPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">
            Features
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">
            Everything in one
            <br />
            revenue platform
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Explore the full AutopilotMonster feature set — from AI CRM and voice calling to
            WhatsApp automation and revenue analytics.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureSections.map((section, i) => (
            <motion.div
              key={section.tag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <Link href={section.href} className="group block h-full">
                <article className="flex flex-col sm:flex-row items-start gap-6 p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] transition-all hover:-translate-y-0.5 h-full">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center shrink-0 shadow-xl shadow-black/20`}
                  >
                    <section.icon className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${section.color} mb-1 block`}
                    >
                      {section.tag}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-400 transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                      {section.desc}
                    </p>
                  </div>
                  <ArrowRight
                    className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0 hidden sm:block"
                    aria-hidden="true"
                  />
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
