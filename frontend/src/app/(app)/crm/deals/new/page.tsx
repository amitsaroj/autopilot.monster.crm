'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { dealService } from '@/services/deal.service';
import { pipelineService, Pipeline } from '@/services/pipeline.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function NewDealPage() {
  const router = useRouter();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    value: '',
    currency: 'USD',
    contactId: '',
    companyId: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await pipelineService.getDefaultPipeline();
        const data = parseApiData<Pipeline>(res);
        setPipeline(data);
      } catch {
        toast.error('Failed to load pipeline');
      }
    };
    void load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipeline?.stages?.[0]) {
      toast.error('No pipeline stage available');
      return;
    }
    setSaving(true);
    try {
      const res = await dealService.createDeal({
        name: form.name,
        value: parseFloat(form.value) || 0,
        currency: form.currency,
        pipelineId: pipeline.id,
        stageId: pipeline.stages[0].id,
        contactId: form.contactId || undefined,
        companyId: form.companyId || undefined,
      });
      const created = parseApiData<{ id: string }>(res);
      toast.success('Deal created');
      router.push(created?.id ? `/crm/deals/${created.id}` : '/crm/deals');
    } catch {
      toast.error('Failed to create deal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <Link href="/crm/deals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Deals
      </Link>
      <h1 className="page-title">New Deal</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium">Deal Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Value</label>
            <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium">Currency</label>
            <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Creating...' : 'Create Deal'}
        </button>
      </form>
    </div>
  );
}
