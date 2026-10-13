'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  Plus,
  Filter,
  Send,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  User,
  Reply,
  Forward,
  Star,
  Archive,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { emailService, type EmailMessage } from '@/services/email.service';

const STATUS_STYLES: Record<string, string> = {
  SENT: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  RECEIVED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  DRAFT: 'bg-gray-500/10 text-muted-foreground border-gray-500/20',
  BOUNCED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminCRMEmailsPage() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await emailService.getEmails();
        const payload = res.data?.data ?? res.data;
        setEmails(Array.isArray(payload) ? payload : (payload?.data ?? []));
      } catch {
        toast.error('Failed to load emails');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = emails.filter((e) => {
    const matchSearch =
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.from.toLowerCase().includes(search.toLowerCase());
    const direction = e.direction === 'INBOUND' ? 'RECEIVED' : 'SENT';
    const matchFilter = filter === 'All' || direction === filter;
    return matchSearch && matchFilter;
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
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">CRM Emails</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Workspace Email Activity Log
          </p>
        </div>
        <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Compose Email
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Received',
            value: emails.filter((e) => e.direction === 'INBOUND').length,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Sent',
            value: emails.filter((e) => e.direction === 'OUTBOUND').length,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Unread',
            value: emails.filter((e) => !e.isRead).length,
            color: 'text-muted-foreground',
            bg: 'bg-gray-500/10',
          },
          { label: 'Total', value: emails.length, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3"
          >
            <div
              className={`w-2 h-2 rounded-full ${s.bg.replace('bg-', 'bg-').replace('/10', '')}`}
            />
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                {s.label}
              </p>
              <p className="text-xl font-semibold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 focus-within:border-blue-500/30 transition-all">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-600"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-card border border-border text-xs text-foreground outline-none font-semibold uppercase tracking-wide"
        >
          {['All', 'RECEIVED', 'SENT', 'DRAFT', 'BOUNCED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((email) => (
          <div
            key={email.id}
            className={`p-5 rounded-2xl border transition-all group cursor-pointer hover:bg-white/[0.04] ${email.isRead ? 'bg-card border-border' : 'bg-card border-blue-500/20'}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-xs border border-blue-500/20 shrink-0">
                {(email.from || '?').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-3">
                    <p
                      className={`text-sm font-bold ${email.isRead ? 'text-foreground' : 'text-foreground'}`}
                    >
                      {email.direction === 'INBOUND' ? email.from : email.to}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[email.direction === 'INBOUND' ? 'RECEIVED' : 'SENT']}`}
                    >
                      {email.direction}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button">
                      <Star className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(email.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <p
                  className={`text-sm mb-1 ${email.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}
                >
                  {email.subject}
                </p>
                <p className="text-xs text-muted-foreground truncate">{email.body}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] transition-all">
                  <Reply className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] transition-all">
                  <Archive className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
