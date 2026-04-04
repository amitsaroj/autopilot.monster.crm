"use client";

import { useState } from 'react';
import {
  MessageSquare, Search, Filter, User, Bot,
  Clock, CheckCircle2, AlertTriangle, ArrowRight,
  ChevronRight, Loader2
} from 'lucide-react';

interface Conversation {
  id: string;
  contact: string;
  agent: string;
  channel: string;
  status: 'OPEN' | 'RESOLVED' | 'ESCALATED';
  messages: number;
  lastMessage: string;
  updatedAt: string;
}

const mockConversations: Conversation[] = [
  { id: '1', contact: 'Sarah Johnson', agent: 'Support Assistant', channel: 'WhatsApp', status: 'RESOLVED', messages: 12, lastMessage: 'Thanks for your help!', updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', contact: 'Mike Chen', agent: 'Sales Qualifier Bot', channel: 'Web Chat', status: 'OPEN', messages: 6, lastMessage: 'Can you tell me more about pricing?', updatedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: '3', contact: 'Alex Rivera', agent: 'Support Assistant', channel: 'Email', status: 'ESCALATED', messages: 18, lastMessage: 'This issue needs human attention', updatedAt: new Date(Date.now() - 900000).toISOString() },
  { id: '4', contact: 'Priya Patel', agent: 'Sales Qualifier Bot', channel: 'Web Chat', status: 'OPEN', messages: 4, lastMessage: 'I am interested in the Enterprise plan', updatedAt: new Date(Date.now() - 300000).toISOString() },
  { id: '5', contact: 'Tom Williams', agent: 'Lead Nurture Agent', channel: 'Email', status: 'RESOLVED', messages: 9, lastMessage: 'Demo scheduled for Friday', updatedAt: new Date(Date.now() - 7200000).toISOString() },
];

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ESCALATED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminAIConversationsPage() {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = conversations.filter(c => {
    const matchSearch = c.contact.toLowerCase().includes(search.toLowerCase()) || c.agent.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Conversations</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">All Agent-Handled Conversation Threads</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open', value: conversations.filter(c => c.status === 'OPEN').length, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Resolved', value: conversations.filter(c => c.status === 'RESOLVED').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Escalated', value: conversations.filter(c => c.status === 'ESCALATED').length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
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

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-purple-500/30 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search by contact or agent..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none font-black uppercase tracking-widest">
          {['All', 'OPEN', 'RESOLVED', 'ESCALATED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Contact', 'Agent', 'Channel', 'Status', 'Messages', 'Last Activity', ''].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(c => (
              <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs border border-indigo-500/20">
                      {c.contact.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{c.contact}</p>
                      <p className="text-[10px] text-gray-600 truncate max-w-[160px]">{c.lastMessage}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Bot className="w-3.5 h-3.5 text-purple-400" /> {c.agent}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">{c.channel}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-400">{c.messages}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" /> {new Date(c.updatedAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
