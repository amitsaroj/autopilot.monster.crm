"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { blogPosts } from '@/lib/marketing/blog-posts';

export default function BlogPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">
            Blog
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">
            Insights & Updates
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Product updates, engineering deep dives, and revenue automation best practices.
          </p>
        </motion.div>
        <div className="space-y-6">
          {blogPosts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all hover:border-gray-300 dark:hover:border-white/[0.12]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">
                    {post.tag}
                  </span>
                  <span className="text-xs text-gray-500">
                    {post.date} · {post.readTime}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
