"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
const posts = [
  { title: 'How AI Voice Agents Are Replacing SDR Teams', tag: 'AI', date: 'Oct 12, 2024', readTime: '8 min read', excerpt: 'Explore how sub-second latency AI calling is transforming outbound sales and why traditional SDR models are becoming obsolete.' },
  { title: 'Building a Multi-Tenant SaaS with NestJS and TypeORM', tag: 'Engineering', date: 'Oct 05, 2024', readTime: '12 min read', excerpt: 'A deep dive into our architecture decisions for tenant isolation, row-level security, and scalable microservices.' },
  { title: 'The ROI of WhatsApp Automation for E-commerce', tag: 'WhatsApp', date: 'Sep 28, 2024', readTime: '6 min read', excerpt: 'Case study: How our customers achieved 340% ROI using WhatsApp broadcast campaigns and AI-powered flows.' },
  { title: 'RAG-Powered Knowledge Bases: A Technical Guide', tag: 'AI', date: 'Sep 20, 2024', readTime: '10 min read', excerpt: 'How we built a production RAG system with Qdrant, OpenAI embeddings, and intelligent chunking strategies.' },
  { title: 'Workflow Automation Best Practices for Revenue Teams', tag: 'Workflows', date: 'Sep 15, 2024', readTime: '7 min read', excerpt: 'The top 10 automation patterns that high-performing revenue teams use to close more deals.' },
  { title: 'AutopilotMonster v2.0: What\'s New', tag: 'Product', date: 'Sep 01, 2024', readTime: '5 min read', excerpt: 'Introducing AI Copilot, advanced pipeline forecasting, and the new visual workflow builder.' },
];
export default function BlogPage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-5xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">Blog</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">Insights & Updates</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Product updates, engineering deep dives, and revenue automation best practices.</p>
      </motion.div>
      <div className="space-y-6">
        {posts.map((post, i) => (
          <motion.div key={post.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.5 }}>
            <Link href="/blog" className="group block p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">{post.tag}</span>
                <span className="text-xs text-gray-500">{post.date} · {post.readTime}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-300 transition-colors">{post.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{post.excerpt}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
