'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import { aiAgentService, Agent } from '@/services/ai-agent.service';

export default function EditAIAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [form, setForm] = useState<Partial<Agent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await aiAgentService.get(id);
        setForm(res.data.data);
      } catch {
        toast.error('Failed to load agent');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await aiAgentService.update(id, form);
      toast.success('Agent updated');
    } catch {
      toast.error('Failed to update agent');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/ai/agents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Agents
      </Link>
      <h1 className="text-2xl font-bold">Edit Agent</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <input value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Voice</label>
          <select value={form.voice ?? 'alloy'} onChange={(e) => setForm({ ...form, voice: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
            {['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">System prompt</label>
          <textarea value={form.systemPrompt ?? ''} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} rows={5} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
