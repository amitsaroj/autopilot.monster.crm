'use client';

import { useEffect, useState } from 'react';
import { Plus, Zap, Play, Pause, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { workflowService, Workflow, WorkflowExecution } from '@/services/workflow.service';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [wfRes, execRes] = await Promise.all([
          workflowService.list(),
          workflowService.getExecutions(),
        ]);
        setWorkflows(wfRes.data?.data ?? []);
        setExecutions(execRes.data?.data ?? []);
      } catch {
        toast.error('Failed to load workflows');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const activeCount = workflows.filter((w) => w.isPublished).length;
  const today = new Date().toDateString();
  const runsToday = executions.filter(
    (e) => new Date(e.startedAt).toDateString() === today,
  ).length;
  const errors24h = executions.filter((e) => {
    const started = new Date(e.startedAt).getTime();
    return e.status === 'FAILED' && Date.now() - started < 86400000;
  }).length;

  const getRunStats = (workflowId: string) => {
    const runs = executions.filter((e) => e.flowId === workflowId);
    const errors = runs.filter((e) => e.status === 'FAILED').length;
    const last = runs[0];
    return { runs: runs.length, errors, lastRun: last?.startedAt };
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workflows</h1>
          <p className="page-description">Automate repetitive tasks and processes</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/workflows/templates" className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            Browse Templates
          </Link>
          <Link href="/workflows/builder" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> New Workflow
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Workflows', value: String(activeCount) },
          { label: 'Runs Today', value: String(runsToday) },
          { label: 'Errors (24h)', value: String(errors24h) },
        ].map((s) => (
          <div key={s.label} className="stat-card text-center">
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {workflows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No workflows yet. Create one to get started.</p>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Workflow</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Runs</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Errors</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workflows.map((w) => {
                const stats = getRunStats(w.id);
                return (
                  <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[hsl(246,80%,60%)]/10">
                          <Zap className="h-3.5 w-3.5 text-[hsl(246,80%,60%)]" />
                        </div>
                        <Link href={`/workflows/${w.id}`} className="font-medium hover:text-[hsl(246,80%,60%)]">
                          {w.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{w.type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${w.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                        {w.isPublished ? <CheckCircle className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                        {w.isPublished ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{stats.runs}</td>
                    <td className="px-4 py-3">
                      {stats.errors > 0 ? (
                        <span className="flex items-center gap-1 text-red-500 text-xs">
                          <AlertCircle className="h-3 w-3" />{stats.errors}
                        </span>
                      ) : (
                        <span className="text-green-500 text-xs">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {stats.lastRun ? new Date(stats.lastRun).toLocaleString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
