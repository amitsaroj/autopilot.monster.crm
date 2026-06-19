'use client';

import { useEffect, useState } from 'react';
import { Store, Search, CheckCircle, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { marketplaceService, MarketplacePlugin } from '@/services/marketplace.service';

export default function MarketplacePage() {
  const [apps, setApps] = useState<MarketplacePlugin[]>([]);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [appsRes, installedRes] = await Promise.all([
          marketplaceService.listApps(),
          marketplaceService.listInstalled(),
        ]);
        setApps(appsRes.data?.data ?? []);
        const ids = new Set(
          (installedRes.data?.data ?? []).map((item) => item.pluginId),
        );
        setInstalledIds(ids);
      } catch {
        toast.error('Failed to load marketplace');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.category ?? '').toLowerCase().includes(search.toLowerCase()),
  );

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
          <h1 className="page-title">Marketplace</h1>
          <p className="page-description">{apps.length} integrations and plugins</p>
        </div>
        <Link
          href="/marketplace/installed"
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <CheckCircle className="h-4 w-4" /> Installed ({installedIds.size})
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search marketplace..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
          <Filter className="h-4 w-4" /> Category
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((app) => (
          <Link
            key={app.id}
            href={`/marketplace/${app.id}`}
            className="group rounded-xl border border-border bg-card p-5 hover:border-[hsl(246,80%,60%)]/50 hover:shadow-md transition-all block"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl border border-border bg-muted flex items-center justify-center">
                <Store className="h-5 w-5 text-muted-foreground" />
              </div>
              {installedIds.has(app.id) && (
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Installed
                </span>
              )}
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-[hsl(246,80%,60%)] transition-colors">
              {app.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3 line-clamp-2">
              {app.description ?? 'No description'}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {app.version && <span>v{app.version}</span>}
              {app.category && (
                <span className="px-1.5 py-0.5 bg-muted rounded">{app.category}</span>
              )}
              {app.isPremium && (
                <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 rounded">Premium</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
