'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { analyticsDashboardService } from '@/services/analytics-dashboard.service';

export default function NewDashboardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await analyticsDashboardService.create({
        name,
        description,
        widgets: [],
      });
      toast.success('Dashboard created');
      router.push(`/analytics/dashboards/${res.data.data.id}`);
    } catch {
      toast.error('Failed to create dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <Link href="/analytics/dashboards" className="inline-flex items-center gap-2 text-sm text-[hsl(246,80%,60%)]">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="page-title">New Dashboard</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dashboard name"
          required
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          rows={3}
        />
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin inline" /> : 'Create Dashboard'}
        </button>
      </form>
    </div>
  );
}
