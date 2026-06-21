'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { workflowService, WorkflowTrigger } from '@/services/workflow.service';

export default function WorkflowTemplatesPage() {
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([]);
  const [actions, setActions] = useState<WorkflowTrigger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, aRes] = await Promise.all([
          workflowService.getTriggers(),
          workflowService.getActions(),
        ]);
        setTriggers(tRes.data?.data ?? []);
        setActions(aRes.data?.data ?? []);
      } catch {
        toast.error('Failed to load workflow templates');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/workflows" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Workflows
      </Link>
      <h1 className="page-title">Workflow Templates</h1>
      <p className="page-description">Available triggers and actions for building automations</p>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold mb-3">Triggers</h2>
          <div className="space-y-2">
            {triggers.map((t) => (
              <div key={t.key} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <Zap className="h-4 w-4 text-[hsl(246,80%,60%)]" />
                <div>
                  <p className="font-medium text-sm">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.key}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-3">Actions</h2>
          <div className="space-y-2">
            {actions.map((a) => (
              <div key={a.key} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <Zap className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="font-medium text-sm">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.key}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link
        href="/workflows/builder"
        className="inline-flex px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg"
      >
        Open Workflow Builder
      </Link>
    </div>
  );
}
