'use client';

import { useState, useEffect } from 'react';
import { 
  Puzzle, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical,
  Download,
  ShieldCheck,
  Zap,
  ExternalLink,
  Layers,
  Settings2
} from 'lucide-react';
import { adminMarketplaceService } from '@/services/admin-marketplace.service';
import toast from 'react-hot-toast';

export default function SuperAdminMarketplacePage() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      setLoading(true);
      const res = await adminMarketplaceService.getPlugins();
      setPlugins(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Extension Marketplace</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Global Plugin Ecosystem / Module Control</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-brand/20"
           >
              <Plus className="h-4 w-4" />
              Ingest New Module
           </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand/10 text-brand">
               <Layers className="h-6 w-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Extensions</p>
               <h3 className="text-2xl font-black tracking-tighter">{plugins.length}</h3>
            </div>
         </div>
         <div className="p-6 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
               <Download className="h-6 w-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Installations</p>
               <h3 className="text-2xl font-black tracking-tighter">1,284</h3>
            </div>
         </div>
         <div className="p-6 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
               <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pending Verification</p>
               <h3 className="text-2xl font-black tracking-tighter">0</h3>
            </div>
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-muted/10 animate-pulse border border-border/20" />
          ))
        ) : plugins.length === 0 ? (
          <div className="col-span-full py-20 text-center">
             <Puzzle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
             <p className="text-sm font-black uppercase tracking-widest opacity-40">No modules ingested in the ecosystem</p>
          </div>
        ) : (
          plugins.map((plugin) => (
            <div key={plugin.id} className="group relative rounded-3xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 overflow-hidden transition-all hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/5">
                <div className="absolute top-0 right-0 p-6">
                   <div className="flex gap-2">
                      {plugin.isPremium && (
                         <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md text-[8px] font-black uppercase tracking-widest">Premium</span>
                      )}
                      <span className={`px-2 py-0.5 border rounded-md text-[8px] font-black uppercase tracking-widest ${plugin.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                         {plugin.status}
                      </span>
                   </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                   <div className="h-14 w-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-2xl group-hover:scale-110 transition-transform">
                      {plugin.icon ? <img src={plugin.icon} className="w-8 h-8 object-contain" /> : <Puzzle className="h-8 w-8" />}
                   </div>
                   <div>
                      <h3 className="text-lg font-black tracking-tighter group-hover:text-brand transition-colors">{plugin.name}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">v{plugin.version} • {plugin.author}</p>
                   </div>
                </div>

                <p className="text-xs text-muted-foreground font-medium mb-8 line-clamp-2 leading-relaxed uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">
                   {plugin.description || 'No specialized description provided for this architectural extension module.'}
                </p>

                <div className="flex items-center gap-3 pt-6 border-t border-border/10">
                   <button className="flex-1 py-2.5 bg-muted/40 hover:bg-muted text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                      <Settings2 className="h-3 w-3" />
                      Configure
                   </button>
                   <button className="p-2.5 bg-muted/40 hover:bg-brand hover:text-white rounded-xl transition-all group/pop">
                      <ExternalLink className="h-3.5 w-3.5" />
                   </button>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
