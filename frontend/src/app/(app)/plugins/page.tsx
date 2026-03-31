import { Puzzle, Plus, Settings, Activity, Webhook, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const plugins = [
  { name: 'Stripe Connector', version: '2.1.0', status: 'Active', webhooks: 3, lastEvent: '5m ago' },
  { name: 'Custom AI Score', version: '1.0.4', status: 'Active', webhooks: 1, lastEvent: '1h ago' },
  { name: 'Legacy CRM Import', version: '0.9.2', status: 'Inactive', webhooks: 0, lastEvent: 'Never' },
];

export default function PluginsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Plugins</h1>
          <p className="page-description">Custom integrations registered for this workspace</p>
        </div>
        <Link href="/plugins/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Register Plugin
        </Link>
      </div>
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {plugins.map((p) => (
          <div key={p.name} className="flex items-center gap-5 px-5 py-4 hover:bg-muted/30 transition-colors">
            <div className="p-2.5 rounded-lg bg-muted"><Puzzle className="h-5 w-5 text-muted-foreground" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{p.name}</span>
                <span className="text-xs text-muted-foreground">v{p.version}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Webhook className="h-3 w-3" />{p.webhooks} webhooks</span>
                <span className="flex items-center gap-1"><Activity className="h-3 w-3" />Last event: {p.lastEvent}</span>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
            <div className="flex items-center gap-1">
              <Link href={`/plugins/1`} className="p-2 rounded-lg hover:bg-muted transition-colors"><Settings className="h-4 w-4 text-muted-foreground" /></Link>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          </div>
        ))}
        {plugins.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Puzzle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No plugins registered yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
