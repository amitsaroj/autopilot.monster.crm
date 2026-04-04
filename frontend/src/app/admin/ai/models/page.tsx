"use client";

import { useState } from 'react';
import {
  Cpu, CheckCircle2, Settings, Zap, ArrowRight,
  Globe, Lock, Star, BarChart3, RefreshCw, Plus
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TESTING';
  contextWindow: string;
  costPer1kTokens: number;
  usedBy: number;
  latency: string;
  capabilities: string[];
}

const models: AIModel[] = [
  { id: '1', name: 'GPT-4o', provider: 'OpenAI', version: '2024-05', status: 'ACTIVE', contextWindow: '128K', costPer1kTokens: 0.005, usedBy: 2, latency: '1.2s', capabilities: ['Chat', 'Function Calling', 'Vision'] },
  { id: '2', name: 'GPT-4o Mini', provider: 'OpenAI', version: '2024-07', status: 'ACTIVE', contextWindow: '128K', costPer1kTokens: 0.00015, usedBy: 1, latency: '0.8s', capabilities: ['Chat', 'Function Calling'] },
  { id: '3', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', version: '20241022', status: 'INACTIVE', contextWindow: '200K', costPer1kTokens: 0.003, usedBy: 0, latency: '1.5s', capabilities: ['Chat', 'Analysis', 'Coding'] },
  { id: '4', name: 'Gemini 1.5 Pro', provider: 'Google', version: '002', status: 'TESTING', contextWindow: '1M', costPer1kTokens: 0.00125, usedBy: 0, latency: '1.8s', capabilities: ['Chat', 'Vision', 'Audio'] },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INACTIVE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  TESTING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: 'text-emerald-400',
  Anthropic: 'text-orange-400',
  Google: 'text-blue-400',
};

export default function AdminAIModelsPage() {
  const [activeModel, setActiveModel] = useState<string>('1');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Models</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Configure & Manage LLM Integrations</p>
        </div>
        <button className="px-5 py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {models.map(model => (
          <div key={model.id}
            onClick={() => setActiveModel(model.id)}
            className={`p-6 rounded-2xl border transition-all cursor-pointer group ${activeModel === model.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${PROVIDER_COLORS[model.provider] || 'text-gray-400'}`}>{model.provider}</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-[10px] font-mono text-gray-600">{model.version}</span>
                </div>
                <h3 className="text-lg font-black text-white">{model.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[model.status]}`}>{model.status}</span>
                {activeModel === model.id && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/[0.03]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Context</p>
                <p className="text-sm font-black text-white">{model.contextWindow}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">$/1K Tokens</p>
                <p className="text-sm font-black text-white">${model.costPer1kTokens}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Latency</p>
                <p className="text-sm font-black text-white">{model.latency}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {model.capabilities.map(cap => (
                <span key={cap} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-400 font-black uppercase tracking-widest">{cap}</span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-600">Used by {model.usedBy} agent{model.usedBy !== 1 ? 's' : ''}</span>
              <button className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all">
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" /> API Key Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { provider: 'OpenAI', key: 'sk-proj-****...****4a2c', status: 'Configured' },
            { provider: 'Anthropic', key: 'Not configured', status: 'Missing' },
            { provider: 'Google AI', key: 'Not configured', status: 'Missing' },
          ].map(api => (
            <div key={api.provider} className={`p-4 rounded-xl border ${api.status === 'Configured' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.05]'}`}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-black text-white">{api.provider}</p>
                <span className={`text-[10px] font-black uppercase ${api.status === 'Configured' ? 'text-emerald-400' : 'text-gray-600'}`}>{api.status}</span>
              </div>
              <p className="text-[10px] font-mono text-gray-600">{api.key}</p>
              <button className="mt-3 text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">
                {api.status === 'Configured' ? 'Rotate Key' : 'Add Key'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
