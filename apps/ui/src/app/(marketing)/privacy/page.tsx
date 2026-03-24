"use client";

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Server, Users, Globe } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any }
  }),
};

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative pt-32 pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">
            Legal & Trust
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Privacy Policy
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
                  <Shield className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Introduction</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                At AutopilotMonster, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered customer engagement platform. By accessing or using our services, you agree to the practices described in this policy.
              </p>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Information We Collect</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We collect information that you provide directly to us, information from your use of our services, and information from third-party sources:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                <li className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                  <Users className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <strong className="block text-gray-900 dark:text-white text-sm">Account Data</strong>
                    <span className="text-xs text-gray-500">Name, email, company details, and authentication credentials.</span>
                  </div>
                </li>
                <li className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                  <MessageSquare className="w-5 h-5 text-green-500 shrink-0" />
                  <div>
                    <strong className="block text-gray-900 dark:text-white text-sm">Communication Data</strong>
                    <span className="text-xs text-gray-500">Call recordings, transcripts, WhatsApp messages, and AI interactions.</span>
                  </div>
                </li>
                <li className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                  <Globe className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <strong className="block text-gray-900 dark:text-white text-sm">Usage Data</strong>
                    <span className="text-xs text-gray-500">IP addresses, browser types, device information, and interaction logs.</span>
                  </div>
                </li>
                <li className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                  <Lock className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <strong className="block text-gray-900 dark:text-white text-sm">Billing Data</strong>
                    <span className="text-xs text-gray-500">Payment information processed securely via our payment partners.</span>
                  </div>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Data Security</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We implement robust security measures to protect your data, as detailed in our Security documentation:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 m-0">
                    <strong>Encryption at Rest:</strong> All sensitive data is encrypted using AES-256-GCM.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 m-0">
                    <strong>Encryption in Transit:</strong> Strict TLS 1.3 encryption for all data moving between your browser and our servers.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 m-0">
                    <strong>Access Control:</strong> Granular Role-Based Access Control (RBAC) ensures only authorized personnel can access specific data.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Server className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Data Retention</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide you with our services. If you wish to cancel your account or request that we no longer use your information to provide you services, please contact us. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  < Globe className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Contact Us</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact our data protection officer at <a href="mailto:autopilot.monster@gmail.com" className="text-indigo-500 hover:underline font-semibold">autopilot.monster@gmail.com</a>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { MessageSquare } from 'lucide-react';
