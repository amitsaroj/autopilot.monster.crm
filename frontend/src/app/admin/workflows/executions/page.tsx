"use client";

import { useState } from 'react';
import { Play, Search, CheckCircle2, XCircle, Clock, RefreshCw, Filter, Eye } from 'lucide-react';

const mockExecutions = [
  { id: '1', workflowName: 'New Lead Auto-assign', runId: 'run_abc123', status: 'SUCCESS', steps: 4, duration: '1.2s', triggeredBy: 'Lead Created Event', startedAt: new Date(Date.now() - 300000).toISOString() },
  { id: '2', workflowName: 'Deal Stage Email', runId: 'run_def456', status: 'SUCCESS', steps: 3, duration: '0.8s', triggeredBy: 'Deal Stage Changed', startedAt: new Date(Date.now() - 720000).toISOString() },
  { id: '3', workflowName: 'WhatsApp Follow-up', runId: 'run_ghi789', status: 'FAILED', steps: 2, duration: '3.1s', triggeredBy: 'Contact Inactivity', startedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '4', workflowName: 'Invoice Generation', runId: 'run_jkl012', status: 'SUCCESS', steps: 6, duration: '2.4s', triggeredBy: 'Deal Closed Won', startedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '5', workflowName: 'Welcome Email Sequence', runId: 'run_mno345', status: 'RUNNING', steps: 1, duration: '—', triggeredBy: 'User Registered', startedAt: new Date(Date.now() - 60000).toISOString() },
];

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  RUNNING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function AdminWorkflowExecutionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = mockExecutions.filter(e => {
    const matchSearch = e.workflowName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Workflow Executions</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Live & Historical Run Monitor</p>
        </div>
        <button className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Successful', value: mockExecutions.filter(e => e.status === 'SUCCESS').length, color: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Failed', value: mockExecutions.filter(e => e.status === 'FAILED').length, color: 'text-red-400', icon: XCircle },
          { label: 'Running', value: mockExecutions.filter(e => e.status === 'RUNNING').length, color: 'text-blue-400', icon: Play },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <s.icon className={`w-6 h-6 ${s.color} shrink-0`} />
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search by workflow name..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none font-black uppercase tracking-widest">
          {['All', 'SUCCESS', 'FAILED', 'RUNNING'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Workflow', 'Run ID', 'Status', 'Steps', 'Duration', 'Trigger', 'Started', ''].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(exec => (
              <tr key={exec.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-sm font-bold text-white">{exec.workflowName}</td>
                <td className="px-5 py-4 text-xs font-mono text-gray-500">{exec.runId}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[exec.status]}`}>{exec.status}</span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">{exec.steps} steps</td>
                <td className="px-5 py-4 text-xs font-mono text-gray-400">{exec.duration}</td>
                <td className="px-5 py-4 text-xs text-gray-500">{exec.triggeredBy}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />{new Date(exec.startedAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
