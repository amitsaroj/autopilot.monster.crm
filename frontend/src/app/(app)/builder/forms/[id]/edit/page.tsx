'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { flowService, Flow } from '@/services/flow.service';

export default function EditBuilderFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [name, setName] = useState('');
  const [json, setJson] = useState('{}');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void flowService.get(id).then((r) => {
      setFlow(r.data.data);
      setName(r.data.data.name);
      setJson(JSON.stringify(r.data.data.definition ?? {}, null, 2));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      await flowService.update(id, { name, definition: JSON.parse(json) as Record<string, unknown> });
      toast.success('Form saved');
    } catch {
      toast.error('Save failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <Link href="/builder/forms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Forms</Link>
      <h1 className="text-2xl font-bold">Edit Form: {flow?.name}</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
      <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={16} className="w-full rounded-xl border border-border bg-card p-4 font-mono text-xs" />
      <button type="button" onClick={() => void handleSave()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Save className="h-4 w-4" /> Save</button>
    </div>
  );
}
