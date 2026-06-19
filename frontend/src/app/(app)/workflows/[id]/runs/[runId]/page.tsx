'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { workflowService, WorkflowExecution } from '@/services/workflow.service';

export default function WorkflowRunDetailPage({
  params,
}: {
  params: Promise<{ id: string; runId: string }>;
}) {
  const { id, runId } = use(params);
  const [run, setRun] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await workflowService.getExecution(runId);
        setRun(res.data?.data ?? null);
      } catch {
        toast.error('Failed to load run');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [runId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!run) {
    return <p className="text-sm text-muted-foreground">Run not found.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href={`/workflows/${id}/runs`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Runs
      </Link>
      <h1 className="page-title">Run {run.id.slice(0, 8)}</h1>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm"><span className="text-muted-foreground">Status:</span> {run.status}</p>
        <p className="text-sm"><span className="text-muted-foreground">Started:</span> {new Date(run.startedAt).toLocaleString()}</p>
        {run.completedAt && (
          <p className="text-sm"><span className="text-muted-foreground">Completed:</span> {new Date(run.completedAt).toLocaleString()}</p>
        )}
        {run.error && <p className="text-sm text-red-500">{run.error}</p>}
        {run.input && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Input</p>
            <pre className="text-xs bg-muted/30 p-3 rounded-lg overflow-auto">{JSON.stringify(run.input, null, 2)}</pre>
          </div>
        )}
        {run.output && Object.keys(run.output).length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Output</p>
            <pre className="text-xs bg-muted/30 p-3 rounded-lg overflow-auto">{JSON.stringify(run.output, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
