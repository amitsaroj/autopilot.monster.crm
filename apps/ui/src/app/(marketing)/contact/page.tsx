"use client";
import { motion } from 'framer-motion';
import { Mail, MapPin, MessageCircle } from 'lucide-react';
export default function ContactPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-5xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">Contact</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">Get in touch</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Have questions about pricing, enterprise features, or partnerships? We'd love to hear from you.</p>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-8">
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" placeholder="John" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" placeholder="Smith" /></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work Email</label><input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" placeholder="john@company.com" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none" placeholder="Tell us about your use case..." /></div>
            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all">Send Message</button>
          </form>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-6">
          {[
            { icon: Mail, title: 'Email', info: 'sales@autopilotmonster.com', desc: 'Enterprise & partnership inquiries' },
            { icon: MessageCircle, title: 'Live Chat', info: 'Available 24/7', desc: 'Talk to our AI concierge or a human' },
            { icon: MapPin, title: 'Office', info: 'San Francisco, CA', desc: 'By appointment only' },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06]">
              <item.icon className="w-6 h-6 text-indigo-400 mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
              <p className="text-indigo-400 text-sm font-medium">{item.info}</p>
              <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div></div>
  );
}
