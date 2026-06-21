'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { leadService, Lead } from '@/services/lead.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState<Partial<Lead>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await leadService.getLead(id);
        setForm(parseApiData<Lead>(res) ?? {});
      } catch {
        toast.error('Failed to load lead');
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
      await leadService.updateLead(id, form);
      toast.success('Lead updated');
      router.push(`/crm/leads/${id}`);
    } catch {
      toast.error('Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <Link href={`/crm/leads/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="page-title">Edit Lead</h1>
      <form onSubmit={(e) => void handleSave(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="grid grid-cols-2 gap-4">
          <input value={form.firstName ?? ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
          <input value={form.lastName ?? ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <input value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        <input value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
