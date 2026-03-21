"use client";

import { useState } from 'react';
import { ToggleLeft, ToggleRight, Search, Activity, Flag, AlertTriangle, Cpu, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type FeatureFlag = {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  type: 'Beta' | 'System' | 'AI' | 'Experimental';
  rollout: number;
};

const initialFlags: FeatureFlag[] = [
  { id: '1', name: 'Voice Copilot V2', key: 'ENABLE_VOICE_GATEWAY_V2', description: 'Enable the new sub-millisecond latency WebRTC WebSocket gateway for Realtime API.', enabled: true, type: 'AI', rollout: 100 },
  { id: '2', name: 'WhatsApp Visual Flow Builder', key: 'ENABLE_REACT_FLOW_BUILDER', description: 'Show the drag-and-drop no-code builder for WhatsApp SaaS tenants.', enabled: true, type: 'System', rollout: 100 },
  { id: '3', name: 'Advanced CRM Kanban', key: 'ENABLE_PIPELINE_DND', description: 'Activate HTML5 native drag and drop features heavily processing CRM deal stages.', enabled: true, type: 'Beta', rollout: 50 },
  { id: '4', name: 'Predictive Lead Scoring', key: 'ENABLE_PREDICTIVE_SCORING', description: 'Use background machine learning workers to assign AI scores (0-100) to new contacts.', enabled: false, type: 'AI', rollout: 0 },
  { id: '5', name: 'Multi-Tenant Strict Isolation', key: 'ENABLE_STRICT_RLS', description: 'Enforce Postgres Row-Level Security across all database queries.', enabled: true, type: 'System', rollout: 100 },
  { id: '6', name: 'Dark Mode UI Rewrite', key: 'ENABLE_NATIVE_DARK_MODE', description: 'Tests the new completely overhauled tailwind dark mode colors.', enabled: false, type: 'Experimental', rollout: 5 },
];

const typeStyles: Record<string, string> = {
  'Beta': 'bg-amber-100 text-amber-700 border-amber-200',
  'System': 'bg-slate-100 text-slate-700 border-slate-200',
  'AI': 'bg-purple-100 text-purple-700 border-purple-200',
  'Experimental': 'bg-pink-100 text-pink-700 border-pink-200',
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(initialFlags);
  const [search, setSearch] = useState('');

  const toggleFlag = (id: string) => {
    setFlags(flags.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const filteredFlags = flags.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.key.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Admin Settings</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Feature Flags</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Global Feature Flags</h1>
          <p className="text-sm text-muted-foreground mt-1">Safely roll out new features, test experimental AI models, and act as a kill switch.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg transition-colors shadow-sm">
          <Flag className="w-4 h-4" /> Create Flag
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-800">Proceed with Caution</h4>
          <p className="text-sm text-amber-700 mt-1">
            Modifying global feature flags immediately impacts production runtime behavior for all connected tenants. Disable features instantly if unrecoverable crashes occur.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search flags by name or KEY_IDENTIFIER..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-3 text-sm border border-input rounded-xl bg-card shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
        />
      </div>

      {/* Flags List */}
      <div className="space-y-4">
        {filteredFlags.map((flag) => (
          <div key={flag.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{flag.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${typeStyles[flag.type]}`}>
                  {flag.type}
                </span>
                {flag.type === 'AI' && <Cpu className="w-4 h-4 text-purple-500" />}
                {flag.type === 'System' && <Globe className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-[11px] bg-muted text-muted-foreground px-2 py-1 rounded-md font-mono font-medium border border-border/50">
                  {flag.key}
                </code>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {flag.description}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
              
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${flag.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
                  {flag.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
                <button 
                  onClick={() => toggleFlag(flag.id)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${flag.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${flag.enabled ? 'translate-x-2' : '-translate-x-2'}`} />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full justify-end">
                <span className="text-xs font-semibold text-muted-foreground">Rollout:</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${flag.rollout === 100 ? 'bg-green-500' : flag.rollout > 0 ? 'bg-amber-500' : 'bg-muted-foreground'}`} style={{ width: `${flag.rollout}%` }} />
                </div>
                <span className="text-xs font-bold w-8 text-right text-foreground">{flag.rollout}%</span>
              </div>

            </div>

          </div>
        ))}
        {filteredFlags.length === 0 && (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
            No feature flags found matching "{search}".
          </div>
        )}
      </div>

    </div>
  );
}
