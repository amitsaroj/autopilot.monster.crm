'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { marketplaceService, MarketplacePlugin } from '@/services/marketplace.service';

export default function BrowsePluginsPage() {
  const [apps, setApps] = useState<MarketplacePlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);

  useEffect(() => {
    void marketplaceService.listApps().then((r) => setApps(r.data.data ?? [])).finally(() => setLoading(false));
  }, []);

  const handleInstall = async (id: string) => {
    setInstalling(id);
    try {
      await marketplaceService.install(id);
      toast.success('Plugin installed');
    } catch {
      toast.error('Install failed');
    } finally {
      setInstalling(null);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <Link href="/plugins" className="text-sm text-muted-foreground hover:text-foreground">← Installed Plugins</Link>
      <h1 className="text-2xl font-bold">Marketplace</h1>
      <ul className="divide-y rounded-xl border border-border bg-card">
        {apps.map((p) => (
          <li key={p.id} className="flex items-center justify-between p-4">
            <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.description}</p></div>
            <button type="button" disabled={installing === p.id} onClick={() => void handleInstall(p.id)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"><Download className="h-4 w-4" /> Install</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
