'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { pipelineService, Pipeline } from '@/services/pipeline.service';

export default function PipelineSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void pipelineService.getPipeline(id).then((r) => {
      const p = (r as { data: { data: Pipeline } }).data.data;
      setPipeline(p);
      setCurrency(p.currency ?? 'USD');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      await pipelineService.updatePipeline(id, { currency });
      toast.success('Pipeline settings saved');
    } catch {
      toast.error('Save failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href={`/crm/pipelines/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Pipeline</Link>
      <h1 className="text-2xl font-bold">Pipeline Settings: {pipeline?.name}</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Currency</label><input value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <button type="button" onClick={() => void handleSave()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Save className="h-4 w-4" /> Save</button>
      </div>
    </div>
  );
}
