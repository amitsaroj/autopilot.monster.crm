import { Key, Plus, Copy, Trash2, Eye, EyeOff, Webhook, AlertTriangle } from 'lucide-react';

const keys = [
  { name: 'Production API Key', key: 'sk_live_xxxxxxxxxxxx', scope: 'Full Access', created: 'Mar 1, 2024', lastUsed: '2h ago', status: 'Active' },
  { name: 'Webhook Secret', key: 'whsec_xxxxxxxxxxxx', scope: 'Webhooks Only', created: 'Feb 10, 2024', lastUsed: '1d ago', status: 'Active' },
  { name: 'Dev Key', key: 'sk_test_xxxxxxxxxxxx', scope: 'Read Only', created: 'Jan 5, 2024', lastUsed: '5d ago', status: 'Active' },
];

const webhooks = [
  { url: 'https://myapp.com/api/crm-webhook', events: ['contact.created', 'deal.updated', 'call.completed'], status: 'Active', lastDelivery: '2h ago' },
  { url: 'https://zapier.com/hooks/catch/123/abc', events: ['lead.converted'], status: 'Active', lastDelivery: '1d ago' },
];

export default function SettingsApiPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-title">API Keys & Webhooks</h1>
        <p className="page-description">Manage developer access tokens and webhook endpoints</p>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-600 dark:text-yellow-400">API keys grant full access. Never share them publicly or commit them to version control.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Key className="h-4 w-4 text-[hsl(246,80%,60%)]" /><h2 className="text-sm font-semibold">API Keys</h2></div>
          <button className="flex items-center gap-2 px-3 py-2 text-xs bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg transition-colors"><Plus className="h-3.5 w-3.5" />Generate Key</button>
        </div>
        <div className="space-y-3">
          {keys.map((k) => (
            <div key={k.name} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/20">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{k.name}</p>
                  <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded">{k.scope}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{k.key}</code>
                  <button className="p-1 rounded hover:bg-muted transition-colors"><Copy className="h-3 w-3 text-muted-foreground" /></button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Created {k.created} · Last used {k.lastUsed}</p>
              </div>
              <button className="p-2 rounded-lg border border-border hover:bg-red-500/10 hover:border-red-500/30 transition-colors"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Webhook className="h-4 w-4 text-[hsl(246,80%,60%)]" /><h2 className="text-sm font-semibold">Webhooks</h2></div>
          <button className="flex items-center gap-2 px-3 py-2 text-xs bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg transition-colors"><Plus className="h-3.5 w-3.5" />Add Endpoint</button>
        </div>
        <div className="space-y-3">
          {webhooks.map((w) => (
            <div key={w.url} className="p-4 rounded-lg border border-border bg-muted/20">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-mono text-foreground break-all">{w.url}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {w.events.map((e) => (
                      <span key={e} className="px-2 py-0.5 bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)] text-xs rounded-full font-mono">{e}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Last delivery: {w.lastDelivery}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">{w.status}</span>
                  <button className="p-1.5 rounded-lg border border-border hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
