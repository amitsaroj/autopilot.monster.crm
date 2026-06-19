'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { quoteService, Quote } from '@/services/quote.service';

export default function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<Partial<Quote>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void quoteService.getQuote(id).then((r) => setForm((r as { data: { data: Quote } }).data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href={`/crm/quotes/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Quote</Link>
      <h1 className="text-2xl font-bold">Edit Quote {form.number}</h1>
      <form onSubmit={(e) => { e.preventDefault(); void quoteService.updateQuote(id, form).then(() => toast.success('Saved')).catch(() => toast.error('Failed')); }} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Notes</label><textarea value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <p className="text-sm text-muted-foreground">Total: {form.currency} {Number(form.total ?? 0).toFixed(2)}</p>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Save className="h-4 w-4" /> Save</button>
      </form>
    </div>
  );
}
