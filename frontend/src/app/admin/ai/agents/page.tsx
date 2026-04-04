"use client";

import { useState, useEffect } from 'react';
import {
  Bot, Plus, Search, Play, Pause, Trash2,
  Settings, MoreVertical, CheckCircle2, Clock,
  Loader2, ArrowRight, Zap, MessageSquare, Users
} from 'lucide-react';
import { toast } from 'sonner';

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  model: string;
  conversationsHandled: number;
  successRate: number;
  createdAt: string;
}

const mockAgents: AIAgent[] = [
  { id: '1', name: 'Sales Qualifier Bot', type: 'SALES', status: 'ACTIVE', model: 'gpt-4o', conversationsHandled: 482, successRate: 91, createdAt: new Date().toISOString() },
  { id: '2', name: 'Support Assistant', type: 'SUPPORT', status: 'ACTIVE', model: 'gpt-4o-mini', conversationsHandled: 1204, successRate: 95, createdAt: new Date().toISOString() },
  { id: '3', name: 'Lead Nurture Agent', type: 'NURTURE', status: 'PAUSED', model: 'gpt-4o', conversationsHandled: 89, successRate: 78, createdAt: new Date().toISOString() },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DRAFT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function AdminAIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>(mockAgents);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Agents</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Autonomous Agent Management</p>
        </div>
        <button className="px-5 py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Deploy Agent
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Agents', value: agents.length, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Active', value: agents.filter(a => a.status === 'ACTIVE').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Conversations Handled', value: agents.reduce((s, a) => s + a.conversationsHandled, 0).toLocaleString(), icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-purple-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search agents..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(agent => (
          <div key={agent.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all group">
            <div className="flex justify-between items-start mb-5">
              <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500 transition-all">
                <Bot className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[agent.status]}`}>
                  {agent.status}
                </span>
                <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-base font-black text-white mb-1 group-hover:text-purple-400 transition-colors">{agent.name}</h3>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">{agent.type} · {agent.model}</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Conversations</p>
                <p className="text-base font-black text-white">{agent.conversationsHandled.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Success Rate</p>
                <p className="text-base font-black text-emerald-400">{agent.successRate}%</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center justify-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-gray-500" /> Configure
              </button>
              <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-amber-400 transition-all">
                {agent.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}

        <div className="p-6 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-4 hover:border-purple-500/30 transition-all group cursor-pointer min-h-[280px]">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-all">
            <Plus className="w-8 h-8 text-gray-600 group-hover:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Deploy New Agent</p>
            <p className="text-xs text-gray-600 mt-1">Choose from templates or build custom</p>
          </div>
        </div>
      </div>
    </div>
  );
}
