'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { pipelineService, Pipeline } from '@/services/pipeline.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await pipelineService.getPipelines();
        const all = parseApiData<Pipeline[]>(res) ?? [];
        setPipeline(all.find((p) => p.id === id) ?? null);
      } catch {
        toast.error('Failed to load pipeline');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;
  if (!pipeline) return <p className="text-sm text-muted-foreground">Pipeline not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/crm/pipelines" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Pipelines
      </Link>
      <h1 className="page-title">{pipeline.name}</h1>
      <p className="text-sm text-muted-foreground">{pipeline.currency} · {pipeline.isDefault ? 'Default' : 'Custom'}</p>
      <div className="space-y-2">
        {pipeline.stages.map((stage) => (
          <div key={stage.id} className="rounded-xl border border-border bg-card p-4 flex justify-between">
            <span className="font-medium text-sm">{stage.name}</span>
            <span className="text-xs text-muted-foreground">{stage.probability}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
