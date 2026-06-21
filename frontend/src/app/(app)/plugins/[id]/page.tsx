'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { marketplaceService, MarketplacePlugin } from '@/services/marketplace.service';

export default function PluginDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plugin, setPlugin] = useState<MarketplacePlugin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void marketplaceService.getApp(id).then((r) => setPlugin(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleUninstall = async () => {
    try {
      await marketplaceService.uninstall(id);
      toast.success('Plugin uninstalled');
    } catch {
      toast.error('Uninstall failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!plugin) return <p className="py-8 text-center text-muted-foreground">Plugin not found</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/plugins" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Plugins</Link>
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold">{plugin.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{plugin.description}</p>
        <p className="mt-4 text-xs text-muted-foreground">v{plugin.version} · {plugin.author}</p>
        <button type="button" onClick={() => void handleUninstall()} className="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600"><Trash2 className="h-4 w-4" /> Uninstall</button>
      </div>
    </div>
  );
}
