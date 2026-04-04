"use client";

import { useState } from 'react';
import {
  MessageSquare, Search, Filter, User, Bot,
  Clock, CheckCircle2, Phone, Mail, ArrowRight,
  Plus, MoreVertical, ChevronRight
} from 'lucide-react';

interface InboxThread {
  id: string;
  contact: string;
  channel: 'WhatsApp' | 'Email' | 'Chat' | 'Phone';
  lastMessage: string;
  status: 'OPEN' | 'RESOLVED' | 'PENDING';
  assignedTo: string;
  unread: number;
  updatedAt: string;
}

const mockThreads: InboxThread[] = [
  { id: '1', contact: 'Sarah Johnson', channel: 'WhatsApp', lastMessage: 'Can you send over the pricing sheet?', status: 'OPEN', assignedTo: 'AI Agent', unread: 2, updatedAt: new Date(Date.now() - 600000).toISOString() },
  { id: '2', contact: 'Mike Chen', channel: 'Email', lastMessage: 'Demo confirmed for Thursday 2PM', status: 'RESOLVED', assignedTo: 'Sales Team', unread: 0, updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', contact: 'Priya Patel', channel: 'Chat', lastMessage: 'Having trouble logging in...', status: 'OPEN', assignedTo: 'Support Bot', unread: 3, updatedAt: new Date(Date.now() - 300000).toISOString() },
  { id: '4', contact: 'Tom Williams', channel: 'Phone', lastMessage: 'Called regarding enterprise pricing', status: 'PENDING', assignedTo: 'Unassigned', unread: 0, updatedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '5', contact: 'Alex Rivera', channel: 'WhatsApp', lastMessage: 'Thanks! Looking forward to the onboarding', status: 'RESOLVED', assignedTo: 'Customer Success', unread: 0, updatedAt: new Date(Date.now() - 86400000).toISOString() },
];

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  WhatsApp: MessageSquare,
  Email: Mail,
  Chat: MessageSquare,
  Phone: Phone,
};

const CHANNEL_COLORS: Record<string, string> = {
  WhatsApp: 'text-green-400 bg-green-500/10',
  Email: 'text-blue-400 bg-blue-500/10',
  Chat: 'text-purple-400 bg-purple-500/10',
  Phone: 'text-amber-400 bg-amber-500/10',
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function AdminCRMInboxPage() {
  const [threads] = useState<InboxThread[]>(mockThreads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = threads.filter(t => {
    const matchSearch = t.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">CRM Inbox</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Unified Omnichannel Conversation Hub</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Conversation
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open', value: threads.filter(t => t.status === 'OPEN').length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Pending', value: threads.filter(t => t.status === 'PENDING').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Resolved Today', value: threads.filter(t => t.status === 'RESOLVED').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${s.bg.replace('/10', '')}`} />
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none font-black uppercase tracking-widest">
          {['All', 'OPEN', 'PENDING', 'RESOLVED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(thread => {
          const ChannelIcon = CHANNEL_ICONS[thread.channel];
          const channelColor = CHANNEL_COLORS[thread.channel];
          return (
            <div key={thread.id} className={`p-5 rounded-2xl border transition-all group cursor-pointer hover:bg-white/[0.04] ${thread.unread > 0 ? 'bg-white/[0.03] border-indigo-500/20' : 'bg-white/[0.01] border-white/[0.04]'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm border border-indigo-500/20 shrink-0">
                  {thread.contact.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${thread.unread > 0 ? 'text-white' : 'text-gray-300'}`}>{thread.contact}</p>
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black ${channelColor}`}>
                        <ChannelIcon className="w-2.5 h-2.5" />
                        {thread.channel}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {thread.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center">{thread.unread}</span>
                      )}
                      <span className="text-[10px] text-gray-600 font-mono">{new Date(thread.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate flex-1">{thread.lastMessage}</p>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[thread.status]}`}>{thread.status}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">Assigned: {thread.assignedTo}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
