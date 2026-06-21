'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

import { pipelineService } from '@/services/pipeline.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function NewPipelinePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await pipelineService.createPipeline({ name, currency, isDefault: false, stages: [] });
      const created = parseApiData<{ id: string }>(res);
      toast.success('Pipeline created');
      router.push(created?.id ? `/crm/pipelines/${created.id}` : '/crm/pipelines');
    } catch {
      toast.error('Failed to create pipeline');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg animate-fade-in">
      <Link href="/crm/pipelines" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Pipelines
      </Link>
      <h1 className="page-title">New Pipeline</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pipeline name" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Creating...' : 'Create Pipeline'}
        </button>
      </form>
    </div>
  );
}
