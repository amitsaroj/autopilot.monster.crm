"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';

type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
};

type TestimonialsPageContentProps = {
  testimonials: Testimonial[];
};

export default function TestimonialsPageContent({
  testimonials,
}: TestimonialsPageContentProps) {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">
            Testimonials
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">
            Loved by revenue teams
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            See how companies use AutopilotMonster to automate sales, support, and growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <motion.blockquote
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] flex flex-col"
            >
              <Quote className="w-8 h-8 text-indigo-400 mb-4" aria-hidden="true" />
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer>
                <cite className="not-italic">
                  <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.role}, {item.company}
                  </p>
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Ready to join them? Start your free trial today.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-2xl shadow-indigo-500/25 hover:scale-[1.02] transition-all"
          >
            Start Free Trial <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
