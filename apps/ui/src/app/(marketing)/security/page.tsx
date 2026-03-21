"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Lock, Eye, Server, Key, FileCheck } from 'lucide-react';
const features = [
  { icon: Shield, title: 'Role-Based Access Control', desc: 'Granular RBAC with custom roles, permission sets, and tenant-level isolation.' },
  { icon: Lock, title: 'Encryption', desc: 'AES-256 encryption at rest and TLS 1.3 in transit for all data.' },
  { icon: Eye, title: 'Audit Logging', desc: 'Complete audit trail of every action, API call, and configuration change.' },
  { icon: Server, title: 'Multi-Tenant Isolation', desc: 'Postgres row-level security with UUID-based tenant isolation across all queries.' },
  { icon: Key, title: 'SSO & MFA', desc: 'Enterprise SSO with SAML/OIDC and mandatory MFA for all admin accounts.' },
  { icon: FileCheck, title: 'Compliance', desc: 'SOC 2 Type II, GDPR, HIPAA-ready infrastructure with data residency controls.' },
];
export default function SecurityPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-sm font-medium text-red-400 mb-6"><Shield className="w-4 h-4" /> Security</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">Enterprise-grade<br />security</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">Built from the ground up for enterprise compliance with SOC 2, GDPR, and zero-trust architecture.</p>
        <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-red-500/20 hover:scale-[1.02] transition-all">Request Security Review <ArrowRight className="w-4 h-4" /></Link>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
            <f.icon className="w-8 h-8 text-red-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
