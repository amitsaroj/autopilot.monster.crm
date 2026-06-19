'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, Store, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { marketplaceService, TenantPluginInstallation } from '@/services/marketplace.service';

export default function MarketplaceInstalledPage() {
  const [installed, setInstalled] = useState<TenantPluginInstallation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.listInstalled();
      setInstalled(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load installed apps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUninstall = async (pluginId: string) => {
    if (!confirm('Uninstall this app?')) return;
    try {
      await marketplaceService.uninstall(pluginId);
      toast.success('App uninstalled');
      void load();
    } catch {
      toast.error('Uninstall failed');
    }
  };

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
          <h1 className="page-title">Installed Apps</h1>
          <p className="page-description">Your active integrations</p>
        </div>
        <Link
          href="/marketplace"
          className="text-sm text-[hsl(246,80%,60%)] hover:underline"
        >
          Browse marketplace
        </Link>
      </div>

      {installed.length === 0 ? (
        <p className="text-muted-foreground text-sm">No apps installed yet.</p>
      ) : (
        <div className="grid gap-4">
          {installed.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-border bg-muted flex items-center justify-center">
                  <Store className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{item.plugin?.name ?? item.pluginId}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" /> Installed
                  </p>
                </div>
              </div>
              <button
                onClick={() => void handleUninstall(item.pluginId)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
