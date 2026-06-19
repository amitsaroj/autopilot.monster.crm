'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { whatsappTemplateService } from '@/services/whatsapp-template.service';

export default function NewWhatsappTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', language: 'en', category: 'MARKETING', body: '', header: '', footer: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await whatsappTemplateService.create(form);
      toast.success('Template created');
      router.push(`/whatsapp/templates`);
    } catch {
      toast.error('Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/whatsapp/templates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Templates</Link>
      <h1 className="text-2xl font-bold">New WhatsApp Template</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        {(['name', 'body', 'header', 'footer'] as const).map((f) => (
          <div key={f}>
            <label className="text-sm font-medium capitalize">{f}</label>
            {f === 'body' ? (
              <textarea value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} rows={4} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required />
            ) : (
              <input value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required={f === 'name'} />
            )}
          </div>
        ))}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Create
        </button>
      </form>
    </div>
  );
}
