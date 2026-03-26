'use client';

import { useState, useEffect } from 'react';
import { 
  Database, 
  Save, 
  RefreshCw, 
  Terminal, 
  Plus, 
  Trash2,
  Cpu,
  Zap,
  Lock
} from 'lucide-react';
import { adminConfigService } from '@/services/admin-config.service';

export default function SuperAdminConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await adminConfigService.findAll();
      setConfigs(res.data || []);
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
          <h1 className="page-title font-black text-3xl tracking-tighter">L7 Configuration</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">SuperAdmin / Dynamic Variable Orchestration</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-black shadow-lg shadow-brand/20 text-[10px] uppercase tracking-widest">
            <Plus className="h-4 w-4" />
            Inject Variable
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6">
         {loading ? (
            [...Array(6)].map((_, i) => (
               <div key={i} className="h-24 bg-card/10 border border-border/20 rounded-3xl animate-pulse" />
            ))
         ) : configs.length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-border/20 rounded-[4rem] bg-card/5">
               <Cpu className="h-16 w-16 mx-auto mb-6 text-muted-foreground/20" />
               <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">No Configuration Injections Detected</p>
            </div>
         ) : (
            configs.map((config) => (
               <div key={config.id} className="p-8 bg-card/20 backdrop-blur-xl border border-border/30 rounded-[2.5rem] flex items-center justify-between group hover:border-brand/40 transition-all shadow-xl shadow-black/5">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 rounded-2xl bg-muted/20 border border-border/10 flex items-center justify-center text-muted-foreground group-hover:text-brand transition-colors">
                        <Zap className="h-6 w-6" />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-sm font-black uppercase tracking-widest text-foreground mono">{config.key}</h3>
                           <span className="px-2 py-0.5 bg-muted/30 border border-border/20 rounded text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">{config.category || 'GLOBAL'}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 font-mono font-bold tracking-tighter max-w-md truncate">{config.value}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col items-end gap-1 mr-4">
                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Last Override</span>
                        <span className="text-[9px] font-black text-foreground uppercase tracking-widest">{new Date(config.updatedAt).toLocaleDateString()}</span>
                     </div>
                     <button className="p-3 rounded-xl hover:bg-brand/10 text-muted-foreground hover:text-brand transition-colors">
                        <Save className="h-5 w-5" />
                     </button>
                     <button className="p-3 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-5 w-5" />
                     </button>
                  </div>
               </div>
            ))
         )}
      </div>
    </div>
  );
}
