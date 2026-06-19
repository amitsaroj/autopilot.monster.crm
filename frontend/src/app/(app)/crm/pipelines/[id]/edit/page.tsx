'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { pipelineService, Pipeline } from '@/services/pipeline.service';

export default function EditPipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void pipelineService.getPipeline(id).then((r) => {
      const p = (r as { data: { data: Pipeline } }).data.data;
      setPipeline(p);
      setName(p.name);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      await pipelineService.updatePipeline(id, { name });
      toast.success('Pipeline updated');
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/crm/pipelines" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Pipelines</Link>
      <h1 className="text-2xl font-bold">Edit Pipeline</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <p className="text-sm text-muted-foreground">{pipeline?.stages?.length ?? 0} stages</p>
        <button type="button" onClick={() => void handleSave()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Save className="h-4 w-4" /> Save</button>
      </div>
    </div>
  );
}
