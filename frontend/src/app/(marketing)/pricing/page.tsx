"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check, Zap, Building, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    desc: 'For small teams getting started with AI-powered sales.',
    cta: 'Start Free Trial',
    highlight: false,
    features: ['Up to 1,000 contacts', '1 AI Agent', '500 voice minutes', 'Basic CRM pipeline', 'Email support', '5 workflows'],
  },
  {
    name: 'Growth',
    price: '$199',
    period: '/month',
    desc: 'For scaling teams that need full automation power.',
    cta: 'Start Free Trial',
    highlight: true,
    badge: 'Most Popular',
    features: ['Up to 10,000 contacts', '5 AI Agents', '5,000 voice minutes', 'Advanced pipelines', 'WhatsApp inbox', 'Unlimited workflows', 'Custom analytics', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large organizations with advanced security needs.',
    cta: 'Contact Sales',
    highlight: false,
    features: ['Unlimited contacts', 'Unlimited AI Agents', 'Unlimited voice', 'Multi-tenant isolation', 'SSO & SAML', 'Dedicated CSM', 'Custom SLA', 'On-premise option'],
  },
];

export default function PricingPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">Pricing</span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? 'bg-gradient-to-b from-indigo-500/10 to-purple-500/5 border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/10'
                  : 'bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06]'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-gray-900 dark:text-white text-xs font-bold rounded-full shadow-lg">
                  {plan.badge}
                </span>
              )}
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{plan.desc}</p>
              
              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 text-lg">{plan.period}</span>
              </div>

              <Link
                href="/register"
                className={`w-full py-3 rounded-xl text-center font-semibold text-sm transition-all mb-8 block ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-gray-900 dark:text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]'
                    : 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.08] hover:bg-white/[0.1]'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* FAQ Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Questions?</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Check our FAQ or contact our sales team for custom enterprise plans.</p>
          <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-center gap-2 transition-colors">
            Contact Sales <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
