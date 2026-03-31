"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Handshake, Globe, Zap, Award } from 'lucide-react';
export default function PartnersPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-5xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">Partners</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">Grow with<br />AutopilotMonster</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Join our partner ecosystem and help businesses unlock AI-powered revenue automation.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {[
          { icon: Handshake, title: 'Referral Partners', desc: 'Earn recurring commissions by referring customers to AutopilotMonster. 20% revenue share.' },
          { icon: Globe, title: 'Agency Partners', desc: 'White-label our platform for your clients. Custom branding, dedicated support, and volume pricing.' },
          { icon: Zap, title: 'Technology Partners', desc: 'Integrate your product with our APIs and reach thousands of revenue teams.' },
          { icon: Award, title: 'Solution Partners', desc: 'Certified implementers who help enterprises deploy and configure AutopilotMonster.' },
        ].map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all">
            <p.icon className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{p.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="text-center">
        <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] transition-all">
          Become a Partner <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div></div>
  );
}
