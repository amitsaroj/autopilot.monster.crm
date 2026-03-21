"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CreditCard, Calculator, Receipt, Wallet, BarChart3, Zap } from 'lucide-react';
const features = [
  { icon: CreditCard, title: 'Subscription Billing', desc: 'Flexible plans with monthly/annual billing, trials, and automatic renewals.' },
  { icon: Calculator, title: 'Usage-Based Billing', desc: 'Meter AI minutes, API calls, and contacts with transparent per-unit pricing.' },
  { icon: Receipt, title: 'Invoicing', desc: 'Automated invoice generation, PDF export, and payment tracking.' },
  { icon: Wallet, title: 'Credit System', desc: 'Prepaid credit wallets for AI voice minutes and premium add-ons.' },
  { icon: BarChart3, title: 'Revenue Metrics', desc: 'Track MRR, ARR, churn, LTV, and billing analytics in real-time.' },
  { icon: Zap, title: 'Stripe Integration', desc: 'Native Stripe integration for secure payment processing and PCI compliance.' },
];
export default function ProductBillingPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/5 text-sm font-medium text-pink-400 mb-6"><CreditCard className="w-4 h-4" /> Billing</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">Billing that<br />scales with you</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">Built-in SaaS billing for subscriptions, usage metering, invoicing, and credit wallets.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-pink-500/20 hover:scale-[1.02] transition-all">Get Started <ArrowRight className="w-4 h-4" /></Link>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
            <f.icon className="w-8 h-8 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
