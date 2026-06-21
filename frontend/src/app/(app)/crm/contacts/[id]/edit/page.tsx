'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { use } from 'react';
import { contactService, Contact } from '@/services/contact.service';

export default function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState<Partial<Contact>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void contactService.getContact(id).then((r) => setForm((r as { data: { data: Contact } }).data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await contactService.updateContact(id, form);
      toast.success('Contact updated');
      router.push(`/crm/contacts/${id}`);
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href={`/crm/contacts/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Contact</Link>
      <h1 className="text-2xl font-bold">Edit Contact</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-6">
        {(['firstName', 'lastName', 'email', 'phone', 'jobTitle'] as const).map((f) => (
          <div key={f}><label className="text-sm font-medium capitalize">{f}</label><input value={String(form[f] ?? '')} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        ))}
        <div className="col-span-2"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"><Save className="h-4 w-4" /> Save</button></div>
      </form>
    </div>
  );
}
