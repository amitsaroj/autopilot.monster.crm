'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { aiPromptService, AiPrompt } from '@/services/ai-prompt.service';

export default function AiPromptsPage() {
  const [prompts, setPrompts] = useState<AiPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await aiPromptService.list();
      setPrompts(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prompt?')) return;
    try {
      await aiPromptService.remove(id);
      toast.success('Prompt deleted');
      void load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Prompt Library</h1>
          <p className="page-description">Saved AI prompt templates</p>
        </div>
        <Link href="/ai/prompts/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] text-white rounded-lg text-sm">
          <Plus className="h-4 w-4" /> New Prompt
        </Link>
      </div>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : prompts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No prompts saved yet.</p>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="rounded-xl border border-border bg-card p-4 flex justify-between gap-4">
              <div>
                <p className="font-medium">{prompt.name}</p>
                {prompt.category && <p className="text-xs text-muted-foreground">{prompt.category}</p>}
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{prompt.content}</p>
              </div>
              <button onClick={() => void handleDelete(prompt.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
