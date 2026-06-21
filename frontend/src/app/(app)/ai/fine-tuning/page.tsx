'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Brain, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { fineTuningService, FineTuningJob } from '@/services/fine-tuning.service';

export default function AIFineTuningPage() {
  const [jobs, setJobs] = useState<FineTuningJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [baseModel, setBaseModel] = useState('gpt-4o-mini');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fineTuningService.list();
      setJobs(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load fine-tuning jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await fineTuningService.create({ name: name.trim(), baseModel });
      setName('');
      toast.success('Fine-tuning job created');
      void load();
    } catch {
      toast.error('Failed to create job');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    try {
      await fineTuningService.remove(id);
      toast.success('Job deleted');
      void load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fine-Tuning</h1>
          <p className="page-description">Custom model fine-tuning jobs</p>
        </div>
        <Link href="/ai" className="text-sm text-[hsl(246,80%,60%)] hover:underline">
          Back to AI Hub
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Job name"
          className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-border rounded-lg"
        />
        <select
          value={baseModel}
          onChange={(e) => setBaseModel(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
        >
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o">gpt-4o</option>
        </select>
        <button
          onClick={() => void handleCreate()}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] text-white rounded-lg text-sm disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Start Job
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No fine-tuning jobs yet.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-[hsl(246,80%,60%)]" />
                <div>
                  <p className="font-medium">{job.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.baseModel} → {job.fineTunedModel ?? 'pending'} · {job.status}
                  </p>
                </div>
              </div>
              <button
                onClick={() => void handleDelete(job.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
