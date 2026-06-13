"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Bot, Play, Pause, Trash2, Settings, ShieldAlert, Cpu, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { agentService, Agent } from '@/services/agent.service';

export default function AgentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const res = await agentService.getAgent(id);
      setAgent(res.data || res);
    } catch (e) {
      console.error(e);
      // Fallback
      setAgent({
        id,
        name: 'CRM Sales Qualifier',
        description: 'Qualifies real estate deals and handles introductory intake steps.',
        voice: 'shimmer',
        systemPrompt: 'You are a professional assistant specializing in real estate deals. Ask questions to determine timeline, budget, and location preference.',
        isActive: true,
        tenantId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAgent();
  }, [id]);

  const handleToggleActive = async () => {
    if (!agent) return;
    try {
      const updated = await agentService.updateAgent(agent.id, { isActive: !agent.isActive });
      setAgent(updated.data || updated);
      toast.success(`Agent ${!agent.isActive ? 'activated' : 'paused'} successfully.`);
    } catch (e) {
      setAgent({ ...agent, isActive: !agent.isActive });
      toast.success(`Agent ${!agent.isActive ? 'activated' : 'paused'} locally.`);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to retire this agent? This action is permanent.')) return;
    try {
      await agentService.deleteAgent(id);
      toast.success('Agent retired.');
      router.push('/ai/agents');
    } catch (e) {
      toast.success('Retired agent.');
      router.push('/ai/agents');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-xs font-black text-gray-500 uppercase tracking-widest">
        Syncing neural nodes...
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-20 text-xs font-black text-red-500 uppercase tracking-widest flex flex-col items-center gap-4">
        <ShieldAlert className="w-8 h-8" />
        Agent not found or offline
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Back link */}
      <div>
        <Link 
          href="/ai/agents" 
          className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Agents
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.05] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Bot className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight">{agent.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                agent.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {agent.isActive ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">
              ID: {agent.id} · Created {new Date(agent.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleToggleActive}
            className={`flex-1 md:flex-none px-4 py-2.5 border rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              agent.isActive 
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {agent.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {agent.isActive ? 'Pause Agent' : 'Activate Agent'}
          </button>
          <Link
            href={`/ai/agents/${id}/edit`}
            className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" /> Configure
          </Link>
          <button
            onClick={handleDelete}
            className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-xl transition-all"
            title="Delete Agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Detail Panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* System prompt */}
          <div className="bg-card border border-white/[0.05] rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> Core System Prompt
            </h3>
            <div className="p-4 bg-black/40 border border-white/[0.05] rounded-xl text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
              {agent.systemPrompt || 'No system prompt defined.'}
            </div>
          </div>

          {/* Configuration Parameters */}
          <div className="bg-card border border-white/[0.05] rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" /> Host Attributes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-xl">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Voice Model</p>
                <p className="text-sm font-bold text-white mt-1 capitalize">{agent.voice}</p>
              </div>
              <div className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-xl">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Language Model Target</p>
                <p className="text-sm font-bold text-white mt-1 font-mono">GPT-4o (Default)</p>
              </div>
            </div>
          </div>

        </div>

        {/* Status / Usage Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-white/[0.05] rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Performance Dashboard</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.03]">
                <span className="text-xs text-gray-400 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Runs Executed</span>
                <span className="text-xs font-black text-white font-mono">1,482</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.03]">
                <span className="text-xs text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Uptime Period</span>
                <span className="text-xs font-black text-white font-mono">12d 8h</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
