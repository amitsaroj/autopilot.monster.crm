'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Mail, 
  Zap, 
  ShieldCheck,
  Server,
  Globe,
  Lock
} from 'lucide-react';
import { adminSystemSettingsService } from '@/services/admin-system-settings.service';

export default function SuperAdminSystemSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminSystemSettingsService.getSettings();
      setSettings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Infrastructure', 'Monetization', 'Protocol', 'Security', 'Identity'];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-8">
        <div>
          <h1 className="page-title font-black text-4xl tracking-tighter">System Orchestration</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[11px] mt-1">SuperAdmin / L7 Global Parameter Control</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-8 py-3 bg-brand text-white rounded-2xl hover:opacity-90 transition-all font-black shadow-2xl shadow-brand/30 text-[10px] uppercase tracking-widest">
            <Save className="h-4 w-4" />
            Commit Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Sidebar Navigation */}
         <div className="lg:col-span-3 space-y-2">
            {categories.map((cat) => (
               <button key={cat} className={`w-full text-left px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border ${cat === 'Infrastructure' ? 'bg-brand text-white border-brand shadow-xl' : 'bg-muted/10 text-muted-foreground border-transparent hover:border-border/30'}`}>
                  {cat}
               </button>
            ))}
         </div>

         {/* Settings Grid */}
         <div className="lg:col-span-9 space-y-8">
            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-12 shadow-2xl">
               <h2 className="text-xl font-black tracking-tighter mb-10 flex items-center gap-4">
                  <Server className="h-6 w-6 text-brand" />
                  Cluster Synchronization
               </h2>
               
               <div className="space-y-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-border/10">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Master API Endpoint</label>
                        <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter max-w-sm">Root entry point for global L7 orchestration across all regions.</p>
                     </div>
                     <input type="text" defaultValue="https://core.autopilot.monster" className="w-full md:w-96 px-6 py-3 bg-muted/20 border border-border/20 rounded-xl outline-none focus:border-brand/40 text-[11px] font-mono font-bold text-brand" />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-border/10">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Database Sharding Vector</label>
                        <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter max-w-sm">Global distribution strategy for tenant data persistence.</p>
                     </div>
                     <div className="flex items-center gap-4 w-full md:w-96">
                        <select className="w-full px-6 py-3 bg-muted/20 border border-border/20 rounded-xl outline-none focus:border-brand/40 text-[10px] font-black uppercase tracking-widest appearance-none">
                           <option>Distributed / Consistency-Focus</option>
                           <option>Regional / Latency-Focus</option>
                        </select>
                     </div>
                  </div>

                  <div className="flex items-center justify-between py-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Maintenance Lockdown</label>
                        <p className="text-[10px] text-red-500/60 font-bold uppercase tracking-tighter">Sever all non-admin ingress vectors globally.</p>
                     </div>
                     <div className="w-14 h-8 bg-muted/30 rounded-full relative cursor-pointer border border-border/20 group hover:bg-red-500/10 transition-colors">
                        <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-lg group-hover:bg-red-500 transition-all" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Sub-Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-card/20 backdrop-blur-xl rounded-[2.5rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-brand">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                     <Mail className="h-5 w-5 text-brand" />
                     Broadcast Vector
                  </h3>
                  <div className="space-y-6">
                     <div className="p-5 rounded-2xl bg-muted/10 border border-border/10 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest">SMTP Relay: AWS-SES</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                     </div>
                     <button className="w-full py-4 border border-brand/20 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-brand hover:bg-brand/5 transition-all">
                        Recalibrate Relay
                     </button>
                  </div>
               </div>

               <div className="bg-card/20 backdrop-blur-xl rounded-[2.5rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-purple-500">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                     <Globe className="h-5 w-5 text-purple-500" />
                     Origin Sharding
                  </h3>
                  <div className="space-y-6">
                     <div className="p-5 rounded-2xl bg-muted/10 border border-border/10 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest">Global CDN: Active</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                     </div>
                     <button className="w-full py-4 border border-purple-500/20 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-purple-500 hover:bg-purple-500/5 transition-all">
                        Flush Cache Manifest
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
