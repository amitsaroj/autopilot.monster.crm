'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { workflowService, WorkflowExecution } from '@/services/workflow.service';

export default function WorkflowRunsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [runs, setRuns] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await workflowService.getExecutions();
        const all = res.data?.data ?? [];
        setRuns(all.filter((run) => run.flowId === id));
      } catch {
        setRuns([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href={`/workflows/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Workflow
      </Link>
      <h1 className="page-title">Execution History</h1>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : runs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No runs recorded for this workflow.</p>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <Link
              key={run.id}
              href={`/workflows/${id}/runs/${run.id}`}
              className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/30"
            >
              <div className="flex justify-between">
                <p className="font-medium">{run.status}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(run.startedAt).toLocaleString()}
                </span>
              </div>
              {run.error && <p className="text-sm text-red-500 mt-1">{run.error}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
