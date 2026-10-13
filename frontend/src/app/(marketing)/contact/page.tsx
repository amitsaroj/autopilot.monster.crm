'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-4 block">
            Contact
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-semibold text-gray-900 dark:text-white mb-6">
            Get in touch
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Have questions about pricing, enterprise features, or partnerships? We&apos;d love to
            hear from you.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-8"
          >
            <form className="space-y-6" aria-label="Contact form" onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const body = `Name: ${String(data.get('firstName') ?? '')} ${String(data.get('lastName') ?? '')}\nEmail: ${String(data.get('email') ?? '')}\nCompany: ${String(data.get('company') ?? '')}\n\n${String(data.get('message') ?? '')}`;
              window.location.href = `mailto:contact@autopilotmonster.com?subject=${encodeURIComponent('Autopilot Monster inquiry')}&body=${encodeURIComponent(body)}`;
            }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="contact-first-name"
                    className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                  >
                    First Name
                  </label>
                  <input
                    id="contact-first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-last-name"
                    className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    id="contact-last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    placeholder="Smith"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                >
                  Work Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
                  placeholder="Tell us about your use case..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition-all"
              >
                Open email draft
              </button>
            </form>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            {[
              {
                icon: Mail,
                title: 'Email',
                info: 'contact@autopilotmonster.com',
                desc: 'Enterprise & partnership inquiries',
              },
              {
                icon: MessageCircle,
                title: 'Live Chat',
                info: 'Contact our team',
                desc: 'Ask about support options for your workspace',
              },
              {
                icon: MapPin,
                title: 'Office',
                info: 'Get in touch',
                desc: 'Contact the team to arrange a conversation',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06]"
              >
                <item.icon className="w-6 h-6 text-blue-700 dark:text-blue-400 mb-3" aria-hidden="true" />
                <h2 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h2>
                <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">{item.info}</p>
                <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
