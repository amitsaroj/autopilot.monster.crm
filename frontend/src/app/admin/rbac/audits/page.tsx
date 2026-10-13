'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  Search,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
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
      const res = await api.get('/logs/audit');
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

  const filtered = events.filter((e) => {
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Access Audit Log</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            RBAC Access Events
          </p>
        </div>
        <button
          onClick={fetchEvents}
          className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 focus-within:border-blue-500/30 transition-all">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by actor or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-600"
          />
        </div>
        <select
          value={outcomeFilter}
          onChange={(e) => setOutcomeFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-card border border-border text-xs text-foreground outline-none font-semibold uppercase tracking-wide"
        >
          {['All', 'ALLOWED', 'DENIED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-3xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-card">
              {['Actor', 'Action', 'Resource', 'Outcome', 'Time'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map((event) => {
              const outcome = String(event.metadata?.outcome ?? 'ALLOWED');
              return (
                <tr key={event.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-foreground font-mono">
                        {event.actorId ?? 'system'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-foreground uppercase">
                    {event.action}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground font-mono">
                    {event.resource ?? event.action}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide flex items-center gap-1 w-fit ${outcome === 'ALLOWED' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                    >
                      {outcome === 'ALLOWED' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {outcome}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(event.createdAt).toLocaleString()}
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
