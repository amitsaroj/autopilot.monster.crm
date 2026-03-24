"use client";

import { motion } from 'framer-motion';
import { Activity, Zap, Clock, ShieldCheck, HeartPulse, HelpCircle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any }
  }),
};

export default function SLAPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative pt-32 pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-4">
            Legal & Support
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Service Level Agreement (SLA)
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated} • Version 1.0
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="prose prose-indigo dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-8 md:p-10 shadow-sm transition-all">
            
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Our Commitment</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                This Service Level Agreement ("SLA") outlines our commitment to reliability and availability for the AutopilotMonster platform. We understand that our services are critical for your business operations, and we strive to provide a world-class experience with maximum uptime and responsiveness.
              </p>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Uptime Guarantee</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                We guarantee that the AutopilotMonster platform will be available to you at least <strong className="text-gray-900 dark:text-white">99.9%</strong> of the time in any calendar month.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] flex items-center gap-4">
                  <Clock className="w-8 h-8 text-indigo-500 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white m-0">24/7 Monitoring</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 m-0">Continuous platform health checks.</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] flex items-center gap-4">
                  <HeartPulse className="w-8 h-8 text-rose-500 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white m-0">Rapid Incident Response</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 m-0">Dedicated team for rapid recovery.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Support Response Times</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We prioritize support requests based on their impact:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b dark:border-white/[0.06]">
                    <tr>
                      <th className="py-3 font-bold text-gray-900 dark:text-white">Severity Level</th>
                      <th className="py-3 font-bold text-gray-900 dark:text-white">Response Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-white/[0.06]">
                    <tr>
                      <td className="py-3 text-red-500 font-bold">P0 - Critical Outage</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">&lt; 1 Hour</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-orange-500 font-bold">P1 - Major Issue</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">&lt; 4 Hours</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-amber-500 font-bold">P2 - Standard Issue</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">&lt; 12 Hours</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-blue-500 font-bold">P3 - General Inquiry</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">&lt; 24 Hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Exclusions</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                The SLA does not apply to (a) scheduled maintenance notified at least 24 hours in advance, (b) issues caused by your unauthorized actions or third-party software, or (c) factors outside our reasonable control (e.g., natural disasters, widespread internet outages).
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
