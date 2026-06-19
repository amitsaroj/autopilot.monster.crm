'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import { companyService } from '@/services/company.service';

export default function NewCompanyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    domain: '',
    website: '',
    industry: '',
    phone: '',
    city: '',
    country: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await companyService.createCompany(form);
      toast.success('Company created');
      const id = (res as { data: { data: { id: string } } }).data.data.id;
      router.push(id ? `/crm/companies/${id}` : '/crm/companies');
    } catch {
      toast.error('Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/crm/companies" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Companies
      </Link>
      <h1 className="text-2xl font-bold">New Company</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-6">
        <div className="col-span-2">
          <label className="text-sm font-medium">Company name *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required />
        </div>
        {(['domain', 'website', 'industry', 'phone', 'city', 'country'] as const).map((field) => (
          <div key={field}>
            <label className="text-sm font-medium capitalize">{field}</label>
            <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
        ))}
        <div className="col-span-2">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Create Company
          </button>
        </div>
      </form>
    </div>
  );
}
