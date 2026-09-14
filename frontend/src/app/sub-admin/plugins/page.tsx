'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Puzzle, Power, Loader2, Store, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminPluginsService } from '@/services/sub-admin-plugins.service';

interface TenantPlugin {
  id: string;
  pluginId: string;
  isEnabled: boolean;
  installedAt?: string;
  plugin?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    version?: string;
    author?: string;
    category?: string;
  };
}

function unwrap<T>(response: any, fallback: T): T {
  const payload = response?.data ?? response;
  return (payload?.data ?? payload ?? fallback) as T;
}

export default function SubAdminPluginsPage() {
  const [plugins, setPlugins] = useState<TenantPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await subAdminPluginsService.getPlugins();
      setPlugins(unwrap<TenantPlugin[]>(res, []));
    } catch {
      toast.error('Failed to load installed plugins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDisable = async (pluginId: string) => {
    if (!window.confirm('Disable this plugin for the workspace?')) return;
    setActionId(pluginId);
    try {
      await subAdminPluginsService.disablePlugin(pluginId);
      toast.success('Plugin disabled');
      await load();
    } catch {
      toast.error('Failed to disable plugin');
    } finally {
      setActionId(null);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Plugins</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Installed Workspace Plugins
          </p>
        </div>
        <Link
          href="/sub-admin/marketplace"
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
          <Store className="w-4 h-4" /> Browse Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enabled Plugins', value: plugins.length },
          {
            label: 'Categories',
            value: [...new Set(plugins.map((p) => p.plugin?.category).filter(Boolean))].length,
          },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              {s.label}
            </p>
            <p className="text-2xl font-black text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {plugins.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
          <Puzzle className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No plugins are enabled for this workspace yet.</p>
          <Link
            href="/sub-admin/marketplace"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300"
          >
            Discover plugins <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plugins.map((tp) => (
            <div
              key={tp.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500 transition-all">
                    <Puzzle className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-base font-black text-white">
                      {tp.plugin?.name ?? tp.pluginId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tp.plugin?.author ?? 'Unknown vendor'} · v{tp.plugin?.version ?? '—'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Enabled
                </span>
              </div>
              {tp.plugin?.description && (
                <p className="text-xs text-gray-500 mb-4">{tp.plugin.description}</p>
              )}
              <button
                onClick={() => handleDisable(tp.pluginId)}
                disabled={actionId === tp.pluginId}
                className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-white uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {actionId === tp.pluginId ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Power className="w-3.5 h-3.5" />
                )}
                Disable Plugin
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
