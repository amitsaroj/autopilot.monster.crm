'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Book, Code2, Zap, FileText, Terminal, Globe } from 'lucide-react';
const sections = [
  { icon: Zap, title: 'Getting started', desc: 'Find answers to common questions about your workspace and its capabilities.', href: '/help' },
  { icon: Code2, title: 'API reference', desc: 'Explore the platform API, authentication, and example requests.', href: '/api-docs' },
  { icon: Terminal, title: 'OpenAPI schema', desc: 'Read the published API schema for use with your existing development tools.', href: '/openapi.json' },
  { icon: FileText, title: 'Platform guide', desc: 'Explore CRM, agents, conversations, and visual workflow capabilities.', href: '/product' },
  { icon: Globe, title: 'Integration options', desc: 'Review the available ways to connect the platform to your tools.', href: '/product/integrations' },
  { icon: Book, title: 'Articles and updates', desc: 'Read the existing product and engineering articles.', href: '/blog' },
];
export default function DocsPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-4 block">
            Documentation
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-semibold text-gray-900 dark:text-white mb-6">
            Build with
            <br />
            AutopilotMonster
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Reference material and product guides for your connected workspace.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                href={s.href}
                className="group block py-8 border-b border-border transition-colors h-full"
              >
                <s.icon className="w-8 h-8 text-blue-700 dark:text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {s.desc}
                </p>
                <span className="text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Read more <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
