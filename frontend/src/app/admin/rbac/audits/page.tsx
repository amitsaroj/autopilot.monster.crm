"use client";

import { useState } from 'react';
import {
  Eye, Search, Filter, Clock, User, Shield,
  AlertTriangle, CheckCircle2, ArrowRight, RefreshCw
} from 'lucide-react';

interface AccessEvent {
  id: string;
  actor: string;
  action: string;
  resource: string;
  outcome: 'ALLOWED' | 'DENIED';
  ip: string;
  timestamp: string;
  role: string;
}

const mockEvents: AccessEvent[] = [
  { id: '1', actor: 'admin@workspace.com', action: 'UPDATE', resource: 'billing.subscription', outcome: 'ALLOWED', ip: '192.168.1.1', timestamp: new Date(Date.now() - 600000).toISOString(), role: 'TENANT_ADMIN' },
  { id: '2', actor: 'sarah@workspace.com', action: 'DELETE', resource: 'crm.contacts', outcome: 'DENIED', ip: '10.0.0.42', timestamp: new Date(Date.now() - 1800000).toISOString(), role: 'SALES_REP' },
  { id: '3', actor: 'priya@workspace.com', action: 'READ', resource: 'inbox', outcome: 'ALLOWED', ip: '172.16.0.5', timestamp: new Date(Date.now() - 3600000).toISOString(), role: 'SUPPORT_AGENT' },
  { id: '4', actor: 'mike@workspace.com', action: 'READ', resource: 'analytics', outcome: 'ALLOWED', ip: '10.0.0.18', timestamp: new Date(Date.now() - 7200000).toISOString(), role: 'SALES_REP' },
  { id: '5', actor: 'tom@workspace.com', action: 'WRITE', resource: 'settings', outcome: 'DENIED', ip: '192.168.1.55', timestamp: new Date(Date.now() - 10800000).toISOString(), role: 'ANALYST' },
  { id: '6', actor: 'alex@workspace.com', action: 'READ', resource: 'crm.contacts', outcome: 'ALLOWED', ip: '10.0.1.22', timestamp: new Date(Date.now() - 14400000).toISOString(), role: 'VIEWER' },
];

export default function AdminRBACauditsPage() {
  const [events] = useState<AccessEvent[]>(mockEvents);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('All');

  const filtered = events.filter(e => {
    const matchSearch = e.actor.toLowerCase().includes(search.toLowerCase()) || e.resource.toLowerCase().includes(search.toLowerCase());
    const matchOutcome = outcomeFilter === 'All' || e.outcome === outcomeFilter;
    return matchSearch && matchOutcome;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Access Audits</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">RBAC Access Event Log</p>
        </div>
        <button className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Access Allowed</p>
            <p className="text-2xl font-black text-white">{events.filter(e => e.outcome === 'ALLOWED').length}</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Access Denied</p>
            <p className="text-2xl font-black text-white">{events.filter(e => e.outcome === 'DENIED').length}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search by actor or resource..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none font-black uppercase tracking-widest">
          {['All', 'ALLOWED', 'DENIED'].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Actor', 'Role', 'Action', 'Resource', 'Outcome', 'IP', 'Time'].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(e => (
              <tr key={e.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-xs text-gray-300">{e.actor}</td>
                <td className="px-5 py-4">
                  <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase">{e.role.replace('_', ' ')}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs font-mono text-amber-300">{e.action}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs font-mono text-gray-400">{e.resource}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${e.outcome === 'ALLOWED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{e.outcome}</span>
                </td>
                <td className="px-5 py-4 text-xs font-mono text-gray-500">{e.ip}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />{new Date(e.timestamp).toLocaleTimeString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
