"use client";

import { motion } from 'framer-motion';
import { Cookie, Info, ShieldCheck, Settings, ExternalLink, HelpCircle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any }
  }),
};

export default function CookiesPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative pt-32 pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">
            Legal & Cookies
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Cookie Policy
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
                  <Cookie className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">What are Cookies?</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
              </p>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">How We Use Cookies</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                We use cookies for several reasons. Some cookies are required for technical reasons in order for our platform to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our platform.
              </p>
              
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] transition-all hover:bg-gray-100 dark:hover:bg-white/[0.04]">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white m-0">Essential Cookies</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0 leading-relaxed">
                    These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] transition-all hover:bg-gray-100 dark:hover:bg-white/[0.04]">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white m-0">Performance & Functionality</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0 leading-relaxed">
                    These cookies are used to enhance the performance and functionality of our platform but are non-essential to their use. However, without these cookies, certain functionality (like video) may become unavailable.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">Managing Cookies</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                To learn more about how to manage cookies on your browser, please visit the help pages of your browser:
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                {['Chrome', 'Firefox', 'Safari', 'Edge'].map(browser => (
                  <a key={browser} href="#" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-600">
                    {browser} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">More Information</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you have further questions about how we use cookies or other technologies, please email us at <a href="mailto:autopilot.monster@gmail.com" className="text-indigo-500 hover:underline font-semibold">autopilot.monster@gmail.com</a>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
