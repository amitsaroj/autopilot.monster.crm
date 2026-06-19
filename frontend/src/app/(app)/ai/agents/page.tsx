'use client';

import { useEffect, useState } from 'react';
import { Bot, Plus, Loader2, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { aiAgentService, Agent } from '@/services/ai-agent.service';

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await aiAgentService.list();
        setAgents(res.data?.data ?? []);
      } catch {
        toast.error('Failed to load agents');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleToggle = async (agent: Agent) => {
    try {
      if (agent.isActive) await aiAgentService.pause(agent.id);
      else await aiAgentService.activate(agent.id);
      toast.success(agent.isActive ? 'Agent paused' : 'Agent activated');
      const res = await aiAgentService.list();
      setAgents(res.data?.data ?? []);
    } catch {
      toast.error('Action failed');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Agents</h1>
          <p className="page-description">Autonomous AI agents powering your CRM workflows</p>
        </div>
        <Link href="/ai/agents/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] text-white rounded-lg text-sm">
          <Plus className="h-4 w-4" /> New Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No agents configured.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <div key={agent.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-[hsl(246,80%,60%)]" />
                  <div>
                    <Link href={`/ai/agents/${agent.id}`} className="font-medium hover:text-[hsl(246,80%,60%)]">{agent.name}</Link>
                    <p className="text-xs text-muted-foreground">{agent.voice}</p>
                  </div>
                </div>
                <button onClick={() => void handleToggle(agent)} className="p-2 rounded-lg hover:bg-muted">
                  {agent.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              </div>
              {agent.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{agent.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
