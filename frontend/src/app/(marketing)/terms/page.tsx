"use client";

import { motion } from 'framer-motion';
import { Scale, CheckCircle2, AlertCircle, FileText, Fingerprint, ShieldAlert, CreditCard } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any }
  }),
};

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative pt-32 pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-500 uppercase tracking-wider mb-4">
            Legal & Terms
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated} • Version 1.0
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="prose prose-indigo dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-8 md:p-10 shadow-sm transition-all">
            
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Agreement to Terms</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                By accessing or using AutopilotMonster, you agree to be bound by these Terms of Service. If you are using the service on behalf of an organization, you are agreeing to these terms for that organization and representing that you have the authority to bind that organization to these terms.
              </p>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Account Responsibilities</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                To access features of the platform, you must register for an account. You are responsible for:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Maintaining confidentiality of your credentials.</span>
                </div>
                <div className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Accuracy of information provided during registration.</span>
                </div>
                <div className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">All activities that occur under your account.</span>
                </div>
                <div className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ensuring compliance with local laws and regulations.</span>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Prohibited Use</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="space-y-3 list-none p-0">
                <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1 shrink-0" />
                  Using the service for any illegal purpose or to violate laws in your jurisdiction.
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1 shrink-0" />
                  Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers.
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1 shrink-0" />
                  Taking any action that imposes an unreasonable or disproportionately large load on our infrastructure (e.g., spamming, DoS).
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Subscriptions & Fees</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Fees for our services are billed based on your selected plan. You are responsible for all taxes, and we will charge tax when required to do so. Our subscription fees are non-refundable except as required by law or as explicitly stated in our SLA.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Updates to Terms</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify you of any material changes by posting the new terms on this site. Your continued use of the service after such changes constitutes your acceptance of the new terms.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
