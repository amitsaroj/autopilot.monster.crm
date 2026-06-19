'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { flowService, Flow } from '@/services/flow.service';

export default function EditBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [json, setJson] = useState('{}');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void flowService.get(id).then((r) => {
      setFlow(r.data.data);
      setJson(JSON.stringify(r.data.data.definition ?? {}, null, 2));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      await flowService.update(id, { definition: JSON.parse(json) as Record<string, unknown> });
      toast.success('Flow saved');
    } catch {
      toast.error('Invalid JSON or save failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <Link href="/builder/pages" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Pages</Link>
      <h1 className="text-2xl font-bold">Edit: {flow?.name}</h1>
      <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={20} className="w-full rounded-xl border border-border bg-card p-4 font-mono text-xs" />
      <button type="button" onClick={() => void handleSave()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Save className="h-4 w-4" /> Save Definition</button>
    </div>
  );
}
