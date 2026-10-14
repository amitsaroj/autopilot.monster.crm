'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  User,
  Bot,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  ArrowRight,
  Plus,
  MoreVertical,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  whatsappConversationService,
  type WhatsAppConversation,
} from '@/services/whatsapp-conversation.service';

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
  WhatsApp: 'text-green-700 dark:text-green-400 bg-green-500/10',
  Email: 'text-blue-700 dark:text-blue-400 bg-blue-500/10',
  Chat: 'text-blue-700 dark:text-blue-400 bg-blue-500/10',
  Phone: 'text-amber-700 dark:text-amber-400 bg-amber-500/10',
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
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
        setThreads(
          items.map((c: WhatsAppConversation) => ({
            id: c.phone,
            contact: c.contactName ?? c.phone,
            channel: 'WhatsApp' as const,
            lastMessage: c.lastMessage ?? '',
            status: 'OPEN' as const,
            assignedTo: 'Unassigned',
            unread: c.unreadCount,
            updatedAt: c.lastMessageAt ?? new Date().toISOString(),
          })),
        );
      } catch {
        toast.error('Failed to load inbox');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = threads.filter((t) => {
    const matchSearch = t.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">CRM Inbox</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Unified Omnichannel Conversation Hub
          </p>
        </div>
        <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Conversation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Open',
            value: threads.filter((t) => t.status === 'OPEN').length,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Pending',
            value: threads.filter((t) => t.status === 'PENDING').length,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Resolved Today',
            value: threads.filter((t) => t.status === 'RESOLVED').length,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4"
          >
            <div className={`w-3 h-3 rounded-full ${s.bg.replace('/10', '')}`} />
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                {s.label}
              </p>
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 focus-within:border-blue-500/30 transition-all">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-card border border-border text-xs text-foreground outline-none font-semibold uppercase tracking-wide"
        >
          {['All', 'OPEN', 'PENDING', 'RESOLVED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((thread) => {
          const ChannelIcon = CHANNEL_ICONS[thread.channel];
          const channelColor = CHANNEL_COLORS[thread.channel];
          return (
            <div
              key={thread.id}
              className={`p-5 rounded-2xl border transition-all group cursor-pointer hover:bg-white/[0.04] ${thread.unread > 0 ? 'bg-card border-blue-500/20' : 'bg-card border-border'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-sm border border-blue-500/20 shrink-0">
                  {thread.contact.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-bold ${thread.unread > 0 ? 'text-foreground' : 'text-foreground'}`}
                      >
                        {thread.contact}
                      </p>
                      <div
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold ${channelColor}`}
                      >
                        <ChannelIcon className="w-2.5 h-2.5" />
                        {thread.channel}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {thread.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                          {thread.unread}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(thread.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate flex-1">
                      {thread.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[thread.status]}`}
                      >
                        {thread.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assigned: {thread.assignedTo}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
