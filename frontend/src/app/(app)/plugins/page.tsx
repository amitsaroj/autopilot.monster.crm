'use client';

import { useEffect, useState } from 'react';
import { Puzzle, Plus, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { pluginsService, InstalledPlugin } from '@/services/plugins.service';

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<InstalledPlugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await pluginsService.listInstalled();
        setPlugins(res.data?.data ?? []);
      } catch {
        toast.error('Failed to load plugins');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Plugins</h1>
          <p className="page-description">Installed integrations for this workspace</p>
        </div>
        <Link href="/plugins/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Browse Marketplace
        </Link>
      </div>
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {plugins.map((item) => (
          <div key={item.id} className="flex items-center gap-5 px-5 py-4 hover:bg-muted/30 transition-colors">
            <div className="p-2.5 rounded-lg bg-muted"><Puzzle className="h-5 w-5 text-muted-foreground" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{item.plugin?.name ?? item.pluginId}</span>
                {item.plugin?.version && (
                  <span className="text-xs text-muted-foreground">v{item.plugin.version}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {item.plugin?.description ?? 'No description'}
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              Active
            </span>
            <Link href={`/plugins/${item.pluginId}`} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        ))}
        {plugins.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Puzzle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No plugins installed yet</p>
            <Link href="/marketplace" className="text-sm text-[hsl(246,80%,60%)] hover:underline mt-2 inline-block">
              Browse marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
