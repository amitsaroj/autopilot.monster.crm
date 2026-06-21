'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { dealService, Deal } from '@/services/deal.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState<Partial<Deal>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dealService.getDeal(id);
        setForm(parseApiData<Deal>(res) ?? {});
      } catch {
        toast.error('Failed to load deal');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dealService.updateDeal(id, form);
      toast.success('Deal updated');
      router.push(`/crm/deals/${id}`);
    } catch {
      toast.error('Failed to update deal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <Link href={`/crm/deals/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="page-title">Edit Deal</h1>
      <form onSubmit={(e) => void handleSave(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Value</label>
            <input type="number" value={form.value ?? 0} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Probability (%)</label>
            <input type="number" value={form.probability ?? 0} onChange={(e) => setForm({ ...form, probability: parseInt(e.target.value, 10) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
