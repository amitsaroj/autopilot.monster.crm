"use client";

import { useState, useEffect } from 'react';
import {
  ShieldCheck, Search, Filter, RefreshCw, Download,
  AlertTriangle, CheckCircle2, XCircle, Clock, User,
  Database, Lock, Globe, Loader2, ChevronDown, Activity,
  FileText, Eye, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  resource: string;
  resourceId: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING';
  ip: string;
  userAgent: string;
  createdAt: string;
  tenantId?: string;
  details?: string;
}

const OUTCOME_STYLES: Record<string, string> = {
  SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FAILURE: 'bg-red-500/10 text-red-400 border-red-500/20',
  WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const OUTCOME_ICONS: Record<string, React.ElementType> = {
  SUCCESS: CheckCircle2,
  FAILURE: XCircle,
  WARNING: AlertTriangle,
};

const ACTION_CATEGORIES = ['All', 'AUTH', 'TENANT', 'USER', 'BILLING', 'SYSTEM', 'DATA'];

export default function SystemAuditsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [outcome, setOutcome] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/audit-logs?search=${search}&category=${category}&outcome=${outcome}`);
      const json = await res.json();
      if (json.data) setLogs(json.data);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchLogs, 300);
    return () => clearTimeout(t);
  }, [search, category, outcome]);

  const stats = [
    { label: 'Total Events', value: logs.length, icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Successful', value: logs.filter(l => l.outcome === 'SUCCESS').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Failures', value: logs.filter(l => l.outcome === 'FAILURE').length, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Warnings', value: logs.filter(l => l.outcome === 'WARNING').length, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
              SECURITY LEVEL: CRITICAL
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">System Audit Trail</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Platform-Wide Security Event Chronicle</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchLogs} disabled={loading} className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-5 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group hover:bg-white/[0.04] transition-all">
            <div className={`p-3 rounded-xl ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by actor, resource, action, IP..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
          />
        </div>
        <div className="flex gap-3">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none focus:border-indigo-500/30 transition-all font-black uppercase tracking-widest">
            {ACTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={outcome} onChange={e => setOutcome(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none focus:border-indigo-500/30 transition-all font-black uppercase tracking-widest">
            {['All', 'SUCCESS', 'FAILURE', 'WARNING'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                {['Timestamp', 'Actor', 'Action', 'Resource', 'Outcome', 'IP Address', ''].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-600">
                    <ShieldCheck className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">No audit events match your filters</p>
                  </div>
                </td></tr>
              ) : logs.map(log => {
                const OutcomeIcon = OUTCOME_ICONS[log.outcome] || CheckCircle2;
                return (
                  <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5 opacity-50" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-xs font-bold text-white">{log.actor}</p>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{log.actorRole}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg">{log.action}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-xs text-gray-300 font-medium">{log.resource}</p>
                        {log.resourceId && <p className="text-[10px] font-mono text-gray-600 mt-0.5 truncate max-w-[120px]">{log.resourceId}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${OUTCOME_STYLES[log.outcome]}`}>
                        <OutcomeIcon className="w-3 h-3" /> {log.outcome}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-gray-500">{log.ip || '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-gray-600 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all opacity-0 group-hover:opacity-100">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-white/[0.01] border-t border-white/[0.05] flex items-center justify-between text-xs text-gray-600">
          <span>Showing {logs.length} events</span>
          <div className="flex items-center gap-4">
            <button disabled className="hover:text-white disabled:opacity-30 flex items-center gap-1">
              <ArrowRight className="w-3 h-3 rotate-180" /> Previous
            </button>
            <button disabled className="hover:text-white disabled:opacity-30 flex items-center gap-1">
              Next <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
