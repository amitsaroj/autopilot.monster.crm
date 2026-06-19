'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { workflowService, Workflow } from '@/services/workflow.service';

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await workflowService.get(id);
        setWorkflow(res.data?.data ?? null);
      } catch {
        toast.error('Failed to load workflow');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workflow) {
    return <p className="text-sm text-muted-foreground">Workflow not found.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/workflows"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Workflows
      </Link>

      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[hsl(246,80%,60%)]/10">
            <Zap className="h-5 w-5 text-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <h1 className="page-title">{workflow.name}</h1>
            <p className="page-description">{workflow.description ?? workflow.type}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/workflows/${id}/runs`}
            className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted"
          >
            View Runs
          </Link>
          <Link
            href={`/workflows/${id}/edit`}
            className="px-3 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground mb-2">
          Status: {workflow.isPublished ? 'Published' : 'Draft'}
        </p>
        <pre className="text-xs overflow-auto bg-muted/30 p-4 rounded-lg max-h-96">
          {JSON.stringify(workflow.definition, null, 2)}
        </pre>
      </div>
    </div>
  );
}
