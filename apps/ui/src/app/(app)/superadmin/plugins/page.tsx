'use client';

import { useState, useEffect } from 'react';
import { 
  Puzzle, 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { adminPluginsService } from '@/services/admin-plugins.service';

export default function SuperAdminPluginsPage() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      setLoading(true);
      const res = await adminPluginsService.findAll();
      setPlugins(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Extension System</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">SuperAdmin / Global Plugin Orchestration</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand/20 text-sm">
            <Plus className="h-4 w-4" />
            Ingest Plugin
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading ? (
            [...Array(6)].map((_, i) => (
               <div key={i} className="h-64 bg-card/10 border border-border/20 rounded-3xl animate-pulse" />
            ))
         ) : plugins.length === 0 ? (
            <div className="md:col-span-3 py-32 text-center border-2 border-dashed border-border/20 rounded-[4rem] bg-card/5">
               <Puzzle className="h-16 w-16 mx-auto mb-6 text-muted-foreground/20" />
               <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">No Binary Extensions Isolated</p>
            </div>
         ) : (
            plugins.map((plugin) => (
               <div key={plugin.id} className="p-8 bg-card/20 backdrop-blur-xl border border-border/30 rounded-[2.5rem] flex flex-col justify-between group hover:border-brand/40 transition-all shadow-xl shadow-black/5">
                  <div>
                     <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                           <Puzzle className="h-7 w-7" />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${plugin.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-muted/30 text-muted-foreground border border-border/10'}`}>
                           {plugin.active ? 'OPERATIONAL' : 'DORMANT'}
                        </div>
                     </div>
                     <h3 className="text-lg font-black tracking-tighter mb-2 group-hover:text-brand transition-colors">{plugin.name}</h3>
                     <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">
                        {plugin.description || 'Distributed extension node providing platform-level capabilities.'}
                     </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border/10 flex items-center justify-between">
                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">v{plugin.version}</span>
                     <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                           <Settings className="h-4 w-4 text-muted-foreground/60 hover:text-brand" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                           <Trash2 className="h-4 w-4 text-muted-foreground/60 hover:text-red-500" />
                        </button>
                     </div>
                  </div>
               </div>
            ))
         )}
      </div>
    </div>
  );
}
