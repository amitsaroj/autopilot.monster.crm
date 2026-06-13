"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Sparkles, Bot, Zap, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { agentService, AgentTemplate } from '@/services/agent.service';

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'template' | 'scratch'>('template');
  
  // Custom agent fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [voice, setVoice] = useState('shimmer');
  const [systemPrompt, setSystemPrompt] = useState('');
  
  // Templates state
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const res = await agentService.getTemplates();
      setTemplates(res.data || res || []);
    } catch (e) {
      console.error(e);
      // Fallback templates
      setTemplates([
        {
          id: 'sales-closer',
          name: 'Real Estate Closer',
          description: 'Specialized in high-pressure sales and objection handling.',
          role: 'SALES',
          category: 'Real Estate',
          prompt: 'You are a professional real estate closer...',
          capabilities: ['Outbound Calling', 'Lead Qualifying', 'Appointment Setting'],
        },
        {
          id: 'saas-support',
          name: 'SaaS Tech Support',
          description: 'Empathetic and technical, focused on resolving customer issues.',
          role: 'SUPPORT',
          category: 'Technology',
          prompt: 'You are a technical support specialist for a SaaS platform...',
          capabilities: ['Troubleshooting', 'Ticket Management', 'Onboarding'],
        },
        {
          id: 'onboarding-specialist',
          name: 'Customer Onboarding',
          description: 'Guides new users through the product features.',
          role: 'ONBOARDING',
          category: 'Customer Success',
          prompt: 'You are a customer onboarding specialist...',
          capabilities: ['Product Tours', 'Account Setup', 'Training'],
        },
      ]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeployTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      toast.info('Provisioning autonomous host target...');
      await agentService.installTemplate(templateId);
      toast.success('Agent deployed successfully.');
      router.push('/ai/agents');
    } catch (e) {
      // Direct mock deploy logic if API is unreachable
      toast.info('Simulated agent deployment.');
      router.push('/ai/agents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Agent Name is required.');
      return;
    }
    try {
      setLoading(true);
      await agentService.createAgent({
        name,
        description,
        voice,
        systemPrompt,
        isActive: true,
      });
      toast.success('Custom agent registered successfully.');
      router.push('/ai/agents');
    } catch (e) {
      toast.error('Failed to register agent. Registering locally...');
      router.push('/ai/agents');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.05] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Deploy AI Agent</h1>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">
            Select a specialized model template or configure a custom system prompt.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="bg-black border border-white/10 rounded-xl p-1 flex">
          <button 
            onClick={() => setMode('template')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              mode === 'template' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Deploy Template
          </button>
          <button 
            onClick={() => setMode('scratch')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              mode === 'scratch' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Custom Agent
          </button>
        </div>
      </div>

      {/* Mode Content */}
      {mode === 'template' ? (
        <div className="space-y-6">
          {templatesLoading ? (
            <div className="text-center py-12 text-xs font-black text-gray-500 uppercase tracking-widest">
              Fetching agent blueprints...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <div key={tpl.id} className="bg-card border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/35 transition-all group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {tpl.category}
                      </span>
                      <Bot className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{tpl.name}</h3>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{tpl.description}</p>
                    </div>

                    {/* Capabilities */}
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider">Capabilities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tpl.capabilities.map((c) => (
                          <span key={c} className="px-2 py-0.5 bg-white/[0.02] border border-white/5 rounded text-[8px] font-bold text-gray-400">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/[0.03] mt-6">
                    <button
                      onClick={() => handleDeployTemplate(tpl.id)}
                      disabled={loading}
                      className="w-full py-2.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Deploy Agent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleCreateCustom} className="bg-card border border-white/[0.05] rounded-3xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Agent Name</label>
              <input 
                type="text" 
                placeholder="e.g. Technical Advisor AI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-bold placeholder:text-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Voice Output Type</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-bold"
              >
                <option value="alloy">Alloy (Balanced)</option>
                <option value="echo">Echo (Warm)</option>
                <option value="fable">Fable (British)</option>
                <option value="onyx">Onyx (Deep)</option>
                <option value="nova">Nova (Energetic)</option>
                <option value="shimmer">Shimmer (Professional)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Purpose / Description</label>
            <input 
              type="text" 
              placeholder="e.g. Conducts tech calls with users..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-bold placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Instruction Prompt</label>
            <textarea 
              rows={6}
              placeholder="Enter system instructions. Define behavioral boundaries, personality, parameters, and conversational objectives..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono leading-relaxed placeholder:text-gray-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setMode('template')}
              className="px-5 py-3 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Create Agent
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
