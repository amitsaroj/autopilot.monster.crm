'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { crmMetadataService } from '@/services/crm-metadata.service';

export default function NewCustomFieldPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', fieldType: 'text', entityType: 'contact', isRequired: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crmMetadataService.createCustomField(form);
      toast.success('Custom field created');
      router.push('/crm/custom-fields');
    } catch {
      toast.error('Failed to create field');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/crm/custom-fields" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Custom Fields</Link>
      <h1 className="text-2xl font-bold">New Custom Field</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required /></div>
        <div><label className="text-sm font-medium">Type</label><select value={form.fieldType} onChange={(e) => setForm({ ...form, fieldType: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">{['text', 'number', 'date', 'select', 'boolean'].map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label className="text-sm font-medium">Entity</label><select value={form.entityType} onChange={(e) => setForm({ ...form, entityType: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">{['contact', 'deal', 'company', 'lead'].map((t) => <option key={t}>{t}</option>)}</select></div>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Save className="h-4 w-4" /> Create</button>
      </form>
    </div>
  );
}
