'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { whatsappBroadcastService } from '@/services/whatsapp-broadcast.service';
import { whatsappTemplateService, WhatsappTemplate } from '@/services/whatsapp-template.service';

export default function NewWhatsappBroadcastPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void whatsappTemplateService.list().then((r) => setTemplates(r.data.data ?? []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await whatsappBroadcastService.create({ name, templateId });
      await whatsappBroadcastService.send(res.data.data.id);
      toast.success('Broadcast started');
      router.push('/whatsapp/broadcast');
    } catch {
      toast.error('Failed to create broadcast');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/whatsapp/broadcast" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Broadcasts</Link>
      <h1 className="text-2xl font-bold">New Broadcast</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required /></div>
        <div><label className="text-sm font-medium">Template</label><select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required><option value="">Select template</option>{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Send Broadcast</button>
      </form>
    </div>
  );
}
