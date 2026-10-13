'use client';

import { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  Settings,
  Zap,
  ArrowRight,
  Globe,
  Lock,
  Star,
  BarChart3,
  RefreshCw,
  Plus,
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
  {
    id: '1',
    name: 'GPT-4o',
    provider: 'OpenAI',
    version: '2024-05',
    status: 'ACTIVE',
    contextWindow: '128K',
    costPer1kTokens: 0.005,
    usedBy: 2,
    latency: '1.2s',
    capabilities: ['Chat', 'Function Calling', 'Vision'],
  },
  {
    id: '2',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    version: '2024-07',
    status: 'ACTIVE',
    contextWindow: '128K',
    costPer1kTokens: 0.00015,
    usedBy: 1,
    latency: '0.8s',
    capabilities: ['Chat', 'Function Calling'],
  },
  {
    id: '3',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    version: '20241022',
    status: 'INACTIVE',
    contextWindow: '200K',
    costPer1kTokens: 0.003,
    usedBy: 0,
    latency: '1.5s',
    capabilities: ['Chat', 'Analysis', 'Coding'],
  },
  {
    id: '4',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    version: '002',
    status: 'TESTING',
    contextWindow: '1M',
    costPer1kTokens: 0.00125,
    usedBy: 0,
    latency: '1.8s',
    capabilities: ['Chat', 'Vision', 'Audio'],
  },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  INACTIVE: 'bg-gray-500/10 text-muted-foreground border-gray-500/20',
  TESTING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
};

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: 'text-emerald-700 dark:text-emerald-400',
  Anthropic: 'text-orange-400',
  Google: 'text-blue-700 dark:text-blue-400',
};

export default function AdminAIModelsPage() {
  const [activeModel, setActiveModel] = useState<string>('1');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">AI Models</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Configure & Manage LLM Integrations
          </p>
        </div>
        <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {models.map((model) => (
          <div
            key={model.id}
            onClick={() => setActiveModel(model.id)}
            className={`p-6 rounded-2xl border transition-all cursor-pointer group ${activeModel === model.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-card border-border hover:bg-white/[0.04] hover:border-white/10'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${PROVIDER_COLORS[model.provider] || 'text-muted-foreground'}`}
                  >
                    {model.provider}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-xs font-mono text-muted-foreground">{model.version}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{model.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[model.status]}`}
                >
                  {model.status}
                </span>
                {activeModel === model.id && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Context</p>
                <p className="text-sm font-semibold text-foreground">{model.contextWindow}</p>
              </div>
              <div className="p-3 rounded-xl bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  $/1K Tokens
                </p>
                <p className="text-sm font-semibold text-foreground">${model.costPer1kTokens}</p>
              </div>
              <div className="p-3 rounded-xl bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Latency</p>
                <p className="text-sm font-semibold text-foreground">{model.latency}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {model.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="px-2 py-0.5 rounded-md bg-card border border-border text-xs text-muted-foreground font-semibold uppercase tracking-wide"
                >
                  {cap}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Used by {model.usedBy} agent{model.usedBy !== 1 ? 's' : ''}
              </span>
              <button className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30 transition-all">
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400" /> API Key Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { provider: 'OpenAI', key: 'sk-proj-****...****4a2c', status: 'Configured' },
            { provider: 'Anthropic', key: 'Not configured', status: 'Missing' },
            { provider: 'Google AI', key: 'Not configured', status: 'Missing' },
          ].map((api) => (
            <div
              key={api.provider}
              className={`p-4 rounded-xl border ${api.status === 'Configured' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-card border-border'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-foreground">{api.provider}</p>
                <span
                  className={`text-xs font-semibold uppercase ${api.status === 'Configured' ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}
                >
                  {api.status}
                </span>
              </div>
              <p className="text-xs font-mono text-muted-foreground">{api.key}</p>
              <button className="mt-3 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-300 uppercase tracking-wide">
                {api.status === 'Configured' ? 'Rotate Key' : 'Add Key'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
