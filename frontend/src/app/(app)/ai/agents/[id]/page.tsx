'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { aiAgentService, Agent } from '@/services/ai-agent.service';

export default function AIAgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await aiAgentService.get(id);
        setAgent(res.data?.data ?? null);
      } catch {
        toast.error('Failed to load agent');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;
  if (!agent) return <p className="text-sm text-muted-foreground">Agent not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <Link href="/ai/agents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Agents
      </Link>
      <h1 className="page-title">{agent.name}</h1>
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <p className="text-sm"><span className="text-muted-foreground">Status:</span> {agent.isActive ? 'Active' : 'Paused'}</p>
        <p className="text-sm"><span className="text-muted-foreground">Voice:</span> {agent.voice}</p>
        {agent.description && <p className="text-sm text-muted-foreground">{agent.description}</p>}
        {agent.systemPrompt && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">System Prompt</p>
            <pre className="text-xs bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">{agent.systemPrompt}</pre>
          </div>
        )}
      </div>
      <Link href={`/ai/agents/${id}/edit`} className="inline-flex px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg">Edit Agent</Link>
    </div>
  );
}
