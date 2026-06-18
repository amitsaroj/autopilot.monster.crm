"use client";

import { useState, useEffect } from 'react';
import {
  Eye, Search, Clock, User, Shield,
  AlertTriangle, CheckCircle2, RefreshCw, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';

interface AuditLog {
  id: string;
  actorId?: string;
  action: string;
  resource?: string;
  tenantId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export default function AdminRBACauditsPage() {
  const [events, setEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('All');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      const payload = res.data?.data ?? res.data;
      setEvents(Array.isArray(payload) ? payload : []);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = events.filter(e => {
    const actor = String(e.actorId ?? e.metadata?.actor ?? '');
    const resource = String(e.resource ?? e.metadata?.resource ?? e.action);
    const matchSearch =
      actor.toLowerCase().includes(search.toLowerCase()) ||
      resource.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase());
    const outcome = String(e.metadata?.outcome ?? 'ALLOWED');
    const matchOutcome = outcomeFilter === 'All' || outcome === outcomeFilter;
    return matchSearch && matchOutcome;
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Access Audit Log</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">RBAC Access Events</p>
        </div>
        <button onClick={fetchEvents} className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search by actor or resource..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none font-black uppercase tracking-widest">
          {['All', 'ALLOWED', 'DENIED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Actor', 'Action', 'Resource', 'Outcome', 'Time'].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(event => {
              const outcome = String(event.metadata?.outcome ?? 'ALLOWED');
              return (
                <tr key={event.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-300 font-mono">{event.actorId ?? 'system'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-black text-white uppercase">{event.action}</td>
                  <td className="px-5 py-4 text-xs text-gray-400 font-mono">{event.resource ?? event.action}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit ${outcome === 'ALLOWED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {outcome === 'ALLOWED' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {outcome}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />{new Date(event.createdAt).toLocaleString()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
