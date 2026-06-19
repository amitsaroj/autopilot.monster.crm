'use client';

import { useState } from 'react';
import { Save, ArrowLeft, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { leadService, LeadStatus } from '@/services/lead.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function NewLeadPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: LeadStatus.NEW,
    metadata: { company_name: '', job_title: '', source: 'Website', notes: '' },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await leadService.createLead({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        status: form.status,
        metadata: {
          company_name: form.metadata.company_name,
          job_title: form.metadata.job_title,
          source: form.metadata.source,
          notes: form.metadata.notes,
        },
      });
      const lead = parseApiData<{ id: string }>(res);
      toast.success('Lead created');
      router.push(lead?.id ? `/crm/leads/${lead.id}` : '/crm/leads');
    } catch {
      toast.error('Failed to create lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/crm/leads" className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="page-title mb-0">New Lead</h1>
          <p className="text-xs text-muted-foreground">Capture a new inbound or outbound lead</p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[hsl(246,80%,60%)]" />
          Lead Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">First Name *</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Last Name</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Company</label>
            <input
              value={form.metadata.company_name}
              onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, company_name: e.target.value } })}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Job Title</label>
            <input
              value={form.metadata.job_title}
              onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, job_title: e.target.value } })}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Lead Source</label>
            <select
              value={form.metadata.source}
              onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, source: e.target.value } })}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            >
              {['Website', 'LinkedIn', 'Referral', 'Cold Outreach', 'Event', 'Partner'].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            >
              {Object.values(LeadStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-muted-foreground block mb-1">Notes</label>
            <textarea
              rows={3}
              value={form.metadata.notes}
              onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, notes: e.target.value } })}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)] resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Create Lead
          </button>
          <Link href="/crm/leads" className="px-4 py-2.5 border border-border text-sm rounded-lg hover:bg-muted transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
