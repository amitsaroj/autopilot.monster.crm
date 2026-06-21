'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import { aiAgentService } from '@/services/ai-agent.service';

export default function NewAIAgentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    voice: 'alloy',
    systemPrompt: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await aiAgentService.create(form);
      toast.success('Agent created');
      router.push(`/ai/agents/${res.data.data.id}/edit`);
    } catch {
      toast.error('Failed to create agent');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/ai/agents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Agents
      </Link>
      <h1 className="text-2xl font-bold">New AI Agent</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Voice</label>
          <select value={form.voice} onChange={(e) => setForm({ ...form, voice: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
            {['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">System prompt</label>
          <textarea value={form.systemPrompt} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} rows={5} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required />
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Create Agent
        </button>
      </form>
    </div>
  );
}
