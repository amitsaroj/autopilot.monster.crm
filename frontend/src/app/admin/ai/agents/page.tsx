"use client";

import { useState, useEffect } from 'react';
import {
  Bot, Plus, Search, Play, Pause, Trash2,
  Settings, Loader2, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

import { aiAgentService, Agent } from '@/services/ai-agent.service';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function AdminAIAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await aiAgentService.list();
      setAgents(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleToggle = async (agent: Agent) => {
    try {
      if (agent.isActive) {
        await aiAgentService.pause(agent.id);
      } else {
        await aiAgentService.activate(agent.id);
      }
      toast.success(agent.isActive ? 'Agent paused' : 'Agent activated');
      void load();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this agent?')) return;
    try {
      await aiAgentService.remove(id);
      toast.success('Agent deleted');
      void load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Agents</h1>
          <p className="text-gray-500 text-sm mt-1">Autonomous Agent Management</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Agents', value: agents.length, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Active', value: agents.filter((a) => a.isActive).length, icon: Bot, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Inactive', value: agents.filter((a) => !a.isActive).length, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No agents configured.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((agent) => (
            <div key={agent.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/20 transition-all">
              <div className="flex justify-between items-start mb-5">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${STATUS_STYLES[agent.isActive ? 'ACTIVE' : 'PAUSED']}`}
                >
                  {agent.isActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <h3 className="text-base font-black text-white mb-1">{agent.name}</h3>
              <p className="text-[10px] text-gray-600 uppercase mb-4">{agent.voice}</p>
              {agent.description && (
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{agent.description}</p>
              )}
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-white uppercase flex items-center justify-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-gray-500" /> Configure
                </button>
                <button
                  onClick={() => void handleToggle(agent)}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-amber-400"
                >
                  {agent.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => void handleDelete(agent.id)}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
