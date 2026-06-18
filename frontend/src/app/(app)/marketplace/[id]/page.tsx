'use client';

import { useEffect, useState, use } from 'react';
import { CheckCircle, Loader2, Store, Download } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { marketplaceService, MarketplacePlugin } from '@/services/marketplace.service';

export default function MarketplaceAppDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [app, setApp] = useState<MarketplacePlugin | null>(null);
  const [installed, setInstalled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [appRes, installedRes] = await Promise.all([
          marketplaceService.getApp(id),
          marketplaceService.listInstalled(),
        ]);
        setApp(appRes.data?.data ?? null);
        const isInstalled = (installedRes.data?.data ?? []).some(
          (item) => item.pluginId === id,
        );
        setInstalled(isInstalled);
      } catch {
        toast.error('Failed to load app');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await marketplaceService.install(id);
      setInstalled(true);
      toast.success('App installed');
    } catch {
      toast.error('Install failed');
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!app) {
    return <p className="text-muted-foreground">App not found.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <Link href="/marketplace" className="text-sm text-[hsl(246,80%,60%)] hover:underline">
        Back to marketplace
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl border border-border bg-muted flex items-center justify-center">
            <Store className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{app.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {app.author && `by ${app.author} · `}
              {app.version && `v${app.version}`}
              {app.category && ` · ${app.category}`}
            </p>
          </div>
        </div>

        <p className="text-sm text-foreground leading-relaxed">
          {app.description ?? 'No description available.'}
        </p>

        {installed ? (
          <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-600 rounded-lg text-sm">
            <CheckCircle className="h-4 w-4" /> Installed
          </span>
        ) : (
          <button
            onClick={() => void handleInstall()}
            disabled={installing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] text-white rounded-lg text-sm hover:bg-[hsl(246,80%,55%)] disabled:opacity-50"
          >
            {installing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Install
          </button>
        )}
      </div>
    </div>
  );
}
