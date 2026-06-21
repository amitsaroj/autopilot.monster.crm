"use client";

import { useState, useEffect } from 'react';
import {
  MessageSquare, Search, Filter, User, Bot,
  Clock, CheckCircle2, Phone, Mail, ArrowRight,
  Plus, MoreVertical, ChevronRight, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { whatsappConversationService, type WhatsAppConversation } from '@/services/whatsapp-conversation.service';

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
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await whatsappConversationService.list();
        const items = res.data?.data ?? [];
        setThreads(items.map((c: WhatsAppConversation) => ({
          id: c.phone,
          contact: c.contactName ?? c.phone,
          channel: 'WhatsApp' as const,
          lastMessage: c.lastMessage ?? '',
          status: 'OPEN' as const,
          assignedTo: 'Unassigned',
          unread: c.unreadCount,
          updatedAt: c.lastMessageAt ?? new Date().toISOString(),
        })));
      } catch {
        toast.error('Failed to load inbox');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = threads.filter(t => {
    const matchSearch = t.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

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
