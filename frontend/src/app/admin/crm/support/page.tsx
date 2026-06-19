"use client";

import { useState, useEffect } from 'react';
import {
  HeadphonesIcon, Search, Plus, Filter, User,
  Clock, CheckCircle2, AlertTriangle, ArrowUpRight,
  MessageSquare, Tag, MoreVertical, ChevronRight,
  XCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { supportService, type SupportTicket } from '@/services/support.service';

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  URGENT: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function AdminCRMSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await supportService.getTickets();
        setTickets(res.data?.data ?? []);
      } catch {
        toast.error('Failed to load support tickets');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticketNumber.toLowerCase().includes(search.toLowerCase());
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
          <h1 className="text-3xl font-black text-white tracking-tight">CRM Support</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Workspace Ticket Management</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: tickets.filter(t => t.status === 'OPEN').length, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: MessageSquare },
          { label: 'In Progress', value: tickets.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
          { label: 'Urgent', value: tickets.filter(t => t.priority === 'URGENT').length, color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
          { label: 'Resolved', value: tickets.filter(t => t.status === 'RESOLVED').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
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
        <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none font-black uppercase tracking-widest">
          {['All', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Ticket', 'Contact', 'Category', 'Priority', 'Status', 'Assigned', 'Last Reply', ''].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(t => (
              <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                <td className="px-5 py-4">
                  <div>
                    <p className="text-[10px] font-mono text-gray-600">{t.ticketNumber}</p>
                    <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors max-w-[200px] truncate">{t.subject}</p>
                    <p className="text-[10px] text-gray-600">{t.priority}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs border border-indigo-500/20">T</div>
                    <span className="text-xs text-gray-300">{t.contactId ?? '—'}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">{t.priority}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[t.status]}`}>{t.status.replace('_', ' ')}</span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">{t.assigneeId ?? 'Unassigned'}</td>
                <td className="px-5 py-4 text-xs text-gray-500">{new Date(t.updatedAt).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
