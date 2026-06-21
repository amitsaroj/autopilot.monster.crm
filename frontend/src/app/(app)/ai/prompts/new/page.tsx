'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

import { aiPromptService } from '@/services/ai-prompt.service';

export default function NewAiPromptPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', content: '', category: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await aiPromptService.create(form);
      toast.success('Prompt created');
      router.push('/ai/prompts');
    } catch {
      toast.error('Failed to create prompt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <Link href="/ai/prompts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Prompts
      </Link>
      <h1 className="page-title">New Prompt</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Prompt name" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category (optional)" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Prompt content" rows={8} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Create Prompt'}
        </button>
      </form>
    </div>
  );
}
