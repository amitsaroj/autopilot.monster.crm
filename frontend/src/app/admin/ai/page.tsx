"use client";

import {
  Brain, Bot, MessageSquare, Zap, BarChart3,
  FileText, ArrowRight, Activity, Cpu, Users, Star
} from 'lucide-react';
import Link from 'next/link';

const AI_MODULES = [
  { label: 'AI Agents', href: '/admin/ai/agents', icon: Bot, desc: 'Deploy and manage autonomous AI agents', color: 'text-purple-400', bg: 'bg-purple-500/10', stat: '3 Active' },
  { label: 'Conversations', href: '/admin/ai/conversations', icon: MessageSquare, desc: 'View all AI-handled conversation threads', color: 'text-blue-400', bg: 'bg-blue-500/10', stat: '1,247 Total' },
  { label: 'AI Models', href: '/admin/ai/models', icon: Cpu, desc: 'Configure and fine-tune AI model settings', color: 'text-indigo-400', bg: 'bg-indigo-500/10', stat: '2 Configured' },
  { label: 'Prompt Library', href: '/admin/ai/prompts', icon: FileText, desc: 'Manage system prompts and templates', color: 'text-cyan-400', bg: 'bg-cyan-500/10', stat: '28 Prompts' },
  { label: 'Analytics', href: '/admin/ai/analytics', icon: BarChart3, desc: 'AI performance metrics and usage reports', color: 'text-amber-400', bg: 'bg-amber-500/10', stat: 'Live Data' },
];

export default function AdminAIPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
              AI Engine Active
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Suite</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Intelligent Automation Command Center</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'AI Conversations', value: '1,247', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Tokens Used (30d)', value: '2.4M', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Avg Resolution', value: '94%', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Active Agents', value: '3', icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 hover:bg-white/[0.04] transition-all">
            <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {AI_MODULES.map(mod => (
          <Link key={mod.href} href={mod.href}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform`}>
                <mod.icon className={`w-6 h-6 ${mod.color}`} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{mod.stat}</span>
            </div>
            <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors mb-1">{mod.label}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{mod.desc}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-600 group-hover:text-purple-400 transition-colors uppercase tracking-widest">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
