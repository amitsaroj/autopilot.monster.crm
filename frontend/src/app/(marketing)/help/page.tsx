"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, MessageCircle, CreditCard, Settings, Shield } from 'lucide-react';

const helpTopics = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    desc: 'Workspace setup, user invites, CRM import, and first pipeline configuration.',
    href: '/docs',
  },
  {
    icon: Settings,
    title: 'Integrations',
    desc: 'Connect WhatsApp, voice, email, Stripe billing, and third-party tools.',
    href: '/integrations',
  },
  {
    icon: CreditCard,
    title: 'Billing & Plans',
    desc: 'Subscriptions, usage limits, invoices, and plan upgrades.',
    href: '/pricing',
  },
  {
    icon: Shield,
    title: 'Security & Access',
    desc: 'RBAC roles, SSO, audit logs, and tenant isolation.',
    href: '/security',
  },
  {
    icon: MessageCircle,
    title: 'Contact Support',
    desc: 'Reach our team for enterprise onboarding, bugs, or feature requests.',
    href: '/contact',
  },
];

export default function HelpPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">
            Help Center
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
            How can we help?
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Guides, troubleshooting, and support resources for AutopilotMonster teams.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpTopics.map((topic, i) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={topic.href}
                className="group block p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:border-indigo-500/30 transition-all h-full"
              >
                <topic.icon className="w-8 h-8 text-indigo-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {topic.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  {topic.desc}
                </p>
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
