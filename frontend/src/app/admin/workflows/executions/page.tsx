"use client";

import { useState, useEffect } from 'react';
import { Play, Search, CheckCircle2, XCircle, Clock, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { workflowService, type WorkflowExecution } from '@/services/workflow.service';

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  RUNNING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function AdminWorkflowExecutionsPage() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const res = await workflowService.getExecutions();
      const payload = res.data?.data ?? res.data;
      setExecutions(Array.isArray(payload) ? payload : []);
    } catch {
      toast.error('Failed to load workflow executions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutions();
  }, []);

  const handleRetry = async (execId: string) => {
    setRetryingId(execId);
    try {
      await workflowService.retryExecution(execId);
      toast.success('Execution retry queued');
      await loadExecutions();
    } catch {
      toast.error('Failed to retry execution');
    } finally {
      setRetryingId(null);
    }
  };

  const filtered = executions.filter(e => {
    const matchSearch = e.flowId.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchStatus;
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
          <h1 className="text-3xl font-black text-white tracking-tight">Workflow Executions</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Live & Historical Run Monitor</p>
        </div>
        <button onClick={loadExecutions} className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Successful', value: executions.filter(e => e.status === 'COMPLETED').length, color: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Failed', value: executions.filter(e => e.status === 'FAILED').length, color: 'text-red-400', icon: XCircle },
          { label: 'Running', value: executions.filter(e => e.status === 'RUNNING').length, color: 'text-blue-400', icon: Play },
          { label: 'Paused', value: executions.filter(e => e.status === 'PAUSED').length, color: 'text-amber-400', icon: Clock },
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
          <input type="text" placeholder="Search by workflow or run id..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none font-black uppercase tracking-widest">
          {['All', 'COMPLETED', 'FAILED', 'RUNNING', 'PAUSED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Workflow', 'Run ID', 'Status', 'Started', 'Completed', ''].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(exec => (
              <tr key={exec.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-sm font-bold text-white font-mono">{exec.flowId}</td>
                <td className="px-5 py-4 text-xs font-mono text-gray-500">{exec.id}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[exec.status] ?? STATUS_STYLES.RUNNING}`}>{exec.status}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />{new Date(exec.startedAt).toLocaleString()}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">
                  {exec.completedAt ? new Date(exec.completedAt).toLocaleString() : '—'}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    {exec.status === 'FAILED' && (
                      <button
                        onClick={() => void handleRetry(exec.id)}
                        disabled={retryingId === exec.id}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        title="Retry"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${retryingId === exec.id ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
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
