'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { workflowService, Workflow } from '@/services/workflow.service';

export default function EditWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', definition: '{}' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await workflowService.get(id);
        const wf = res.data?.data;
        if (wf) {
          setForm({
            name: wf.name,
            description: wf.description ?? '',
            definition: JSON.stringify(wf.definition ?? {}, null, 2),
          });
        }
      } catch {
        toast.error('Failed to load workflow');
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
      let definition: Record<string, unknown> = {};
      try {
        definition = JSON.parse(form.definition) as Record<string, unknown>;
      } catch {
        toast.error('Invalid JSON in definition');
        setSaving(false);
        return;
      }
      await workflowService.update(id, {
        name: form.name,
        description: form.description,
        definition,
      });
      toast.success('Workflow updated');
      router.push(`/workflows/${id}`);
    } catch {
      toast.error('Failed to update workflow');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <Link href={`/workflows/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="page-title">Edit Workflow</h1>
      <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Definition (JSON)</label>
          <textarea
            value={form.definition}
            onChange={(e) => setForm({ ...form, definition: e.target.value })}
            rows={12}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
