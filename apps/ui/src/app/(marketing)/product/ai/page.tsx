"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Brain, MessageCircle, Cpu, Database, Wand2 } from 'lucide-react';
const features = [
  { icon: Brain, title: 'Autonomous Reasoning', desc: 'Multi-step AI agents that reason, plan, and execute complex sales sequences without human intervention.' },
  { icon: MessageCircle, title: 'Conversational AI', desc: 'Natural language chat agents that qualify leads, answer FAQs, and book meetings instantly.' },
  { icon: Cpu, title: 'Custom AI Agents', desc: 'Build specialized agents with custom personas, knowledge bases, and tool integrations.' },
  { icon: Database, title: 'RAG Knowledge Base', desc: 'Upload documents to create a vector-powered knowledge base your AI agents can reference in real-time.' },
  { icon: Wand2, title: 'Prompt Engineering', desc: 'Visual prompt builder with version control, A/B testing, and performance analytics.' },
  { icon: Sparkles, title: 'AI Copilot', desc: 'Real-time AI assistant embedded across CRM, calls, and messaging for instant insights.' },
];
export default function ProductAIPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-sm font-medium text-purple-400 mb-6"><Sparkles className="w-4 h-4" /> AI Engine</span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">AI agents that<br />sell for you</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">Deploy autonomous GPT agents that qualify, nurture, and close deals — 24/7, without burnout.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-purple-500/20 hover:scale-[1.02] transition-all">Try AI Free <ArrowRight className="w-4 h-4" /></Link>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
              <f.icon className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
