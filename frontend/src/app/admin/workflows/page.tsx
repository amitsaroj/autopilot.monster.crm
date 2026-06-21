"use client";

import { useEffect, useState } from 'react';
import { Workflow as WorkflowIcon, ArrowRight, Play, Pause, Zap, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { parseApiData } from '@/lib/api/parse-response';
import { workflowService, type WorkflowExecution, type Workflow } from '@/services/workflow.service';

const MODULES = [
  { label: 'All Workflows', href: '/workflows', icon: WorkflowIcon, desc: 'View and manage workspace automations', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Executions', href: '/admin/workflows/executions', icon: Play, desc: 'Monitor live and historical runs', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Triggers', href: '/admin/workflows/triggers', icon: Zap, desc: 'Configure event triggers and webhooks', color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

export default function AdminWorkflowsPage() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [workflowRes, executionRes] = await Promise.all([
          workflowService.list(),
          workflowService.getExecutions(),
        ]);
        setWorkflows(parseApiData<Workflow[]>(workflowRes) ?? []);
        setExecutions(parseApiData<WorkflowExecution[]>(executionRes) ?? []);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const activeCount = workflows.filter((flow) => flow.isPublished).length;
  const failedCount = executions.filter((run) => run.status === 'FAILED').length;
  const todayCount = executions.filter((run) => {
    const started = new Date(run.startedAt);
    const today = new Date();
    return started.toDateString() === today.toDateString();
  }).length;

  const workflowNameById = new Map(workflows.map((flow) => [flow.id, flow.name]));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Workflows Admin</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Automation Engine Management</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Workflows', value: String(activeCount), color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: WorkflowIcon },
          { label: 'Runs Today', value: String(todayCount), color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Play },
          { label: 'Failed Runs', value: String(failedCount), color: 'text-red-400', bg: 'bg-red-500/10', icon: Pause },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {MODULES.map((mod) => (
          <Link key={mod.href} href={mod.href}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform`}>
                <mod.icon className={`w-6 h-6 ${mod.color}`} />
              </div>
            </div>
            <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors mb-1">{mod.label}</h3>
            <p className="text-xs text-gray-500 mb-4">{mod.desc}</p>
            <div className="flex items-center gap-1 text-[10px] font-black text-gray-600 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Recent Execution Log
        </h2>
        <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                {['Workflow', 'Status', 'Started', 'Completed'].map((h) => (
                  <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {executions.slice(0, 8).map((run) => (
                <tr key={run.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 text-sm font-bold text-white">
                    {workflowNameById.get(run.flowId) ?? run.flowId.slice(0, 8)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                      run.status === 'FAILED'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>{run.status}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{new Date(run.startedAt).toLocaleString()}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {run.completedAt ? new Date(run.completedAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
              {executions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-500 text-sm">No executions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
