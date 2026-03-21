'use client';
import { Flag, Plus, Search, Toggle, Trash2, Users, Building2, Edit } from 'lucide-react';
import { useState } from 'react';

const initialFlags = [
  { id: 1, key: 'ai_chat_enabled', name: 'AI Chat', desc: 'Enable AI chat widget for all users', scope: 'all', enabled: true },
  { id: 2, key: 'whatsapp_campaigns', name: 'WhatsApp Campaigns', desc: 'Broadcast campaign feature', scope: 'enterprise', enabled: true },
  { id: 3, key: 'advanced_analytics', name: 'Advanced Analytics', desc: 'Enhanced analytics dashboards', scope: 'pro+', enabled: false },
  { id: 4, key: 'voice_ai_transcription', name: 'Voice AI Transcription', desc: 'Automatic call transcription and summary', scope: 'enterprise', enabled: true },
  { id: 5, key: 'custom_domain', name: 'Custom Domain', desc: 'Custom branded workspace domain', scope: 'enterprise', enabled: false },
  { id: 6, key: 'beta_pipeline_v2', name: 'Pipeline V2 Beta', desc: 'New pipeline interface with AI suggestions', scope: 'beta', enabled: false },
];

const scopeStyle: Record<string, string> = {
  all: 'bg-blue-500/10 text-blue-400',
  enterprise: 'bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]',
  'pro+': 'bg-purple-500/10 text-purple-400',
  beta: 'bg-orange-500/10 text-orange-400',
};

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState(initialFlags);

  const toggle = (id: number) => setFlags(f => f.map(fl => fl.id === id ? { ...fl, enabled: !fl.enabled } : fl));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feature Flags</h1>
          <p className="page-description">Toggle features by plan scope or beta access</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Plus className="h-4 w-4" />New Flag</button>
      </div>
      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search flags..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <div className="ml-auto flex gap-2">
          {['All', 'Enabled', 'Disabled', 'Beta'].map((t, i) => (
            <button key={t} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${i === 0 ? 'bg-[hsl(246,80%,60%)] border-transparent text-white' : 'border-border hover:bg-muted text-muted-foreground'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Feature</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Key</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Scope</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {flags.map((f) => (
              <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2"><Flag className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{f.key}</code></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scopeStyle[f.scope]}`}>{f.scope}</span></td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(f.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${f.enabled ? 'bg-[hsl(246,80%,60%)]' : 'bg-muted'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${f.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button className="p-1.5 rounded-lg border border-border hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
