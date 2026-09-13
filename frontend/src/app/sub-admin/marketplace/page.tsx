'use client';

import { useEffect, useState } from 'react';
import { Store, Loader2, Download, Crown } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminMarketplaceService } from '@/services/sub-admin-marketplace.service';

interface MarketplaceItem {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  version?: string;
  author?: string;
  category?: string;
  isPremium?: boolean;
  price_monthly?: number | string;
  status?: string;
  [k: string]: unknown;
}

function unwrapList(response: any): MarketplaceItem[] {
  const payload = response?.data ?? response;
  const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
  return Array.isArray(list) ? list : [];
}

export default function SubAdminMarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await subAdminMarketplaceService.discover();
      setItems(unwrapList(res));
    } catch {
      toast.error('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleInstall = async (item: MarketplaceItem) => {
    setInstallingId(item.id);
    try {
      await subAdminMarketplaceService.installItem(item.id);
      toast.success(`${item.name ?? 'Item'} installed`);
    } catch {
      toast.error('Failed to install item');
    } finally {
      setInstallingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Marketplace</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
          Discover &amp; Install Integrations
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: 'Available Listings', value: items.length, icon: Store }].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-indigo-500/10">
              <s.icon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center gap-4 text-center">
          <Store className="w-12 h-12 text-gray-700" />
          <p className="text-sm font-medium text-gray-500">
            No marketplace listings are available right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10">
                    <Store className="w-5 h-5 text-indigo-400" />
                  </div>
                  {item.isPremium && (
                    <span className="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>
                <p className="text-base font-black text-white mb-1">{item.name ?? item.slug}</p>
                <p className="text-xs text-gray-500 mb-1">
                  {item.author ?? 'Unknown vendor'} · v{item.version ?? '1.0.0'}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {item.description ?? 'No description provided.'}
                </p>
              </div>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.05]">
                <span className="text-xs font-black text-white">
                  {item.isPremium && item.price_monthly
                    ? `$${item.price_monthly}/mo`
                    : 'Free'}
                </span>
                <button
                  disabled={installingId === item.id}
                  onClick={() => handleInstall(item)}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                >
                  {installingId === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  Install
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
