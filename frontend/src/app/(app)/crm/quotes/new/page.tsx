'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import { quoteService } from '@/services/quote.service';

export default function NewQuotePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    contactId: '',
    dealId: '',
    currency: 'USD',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await quoteService.createQuote({
        ...form,
        lineItems: [],
        contactId: form.contactId || undefined,
        dealId: form.dealId || undefined,
      });
      toast.success('Quote created');
      const id = (res as { data: { data: { id: string } } }).data.data.id;
      router.push(id ? `/crm/quotes/${id}` : '/crm/quotes');
    } catch {
      toast.error('Failed to create quote');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/crm/quotes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Quotes
      </Link>
      <h1 className="text-2xl font-bold">New Quote</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium">Contact ID (optional)</label>
          <input value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Deal ID (optional)</label>
          <input value={form.dealId} onChange={(e) => setForm({ ...form, dealId: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Create Quote
        </button>
      </form>
    </div>
  );
}
