'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  Search, 
  Filter, 
  ShieldCheck, 
  Database,
  ArrowRight,
  ChevronRight,
  Clock,
  Terminal,
  Layers,
  Info
} from 'lucide-react';
import api from '@/lib/api/client';

export default function SuperAdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/events/definitions');
      setEvents(res.data || []);
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
          <h1 className="page-title font-black text-3xl tracking-tighter">Event Registry</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Domain Event Definitions / Protocol Catalog</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span className="text-[10px] font-black text-brand uppercase tracking-widest">Protocol Version 1.2</span>
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-3xl border border-border/30 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl">
         <div className="bg-muted/5 p-6 border-b border-border/20 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <Terminal className="h-4 w-4 text-brand" />
               Registered System Symbols
            </h2>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search constants..."
                    className="pl-9 pr-4 py-2 bg-muted/20 border border-border/20 rounded-lg text-[10px] font-black uppercase outline-none focus:border-brand/40 w-48 transition-all"
                  />
               </div>
            </div>
         </div>
         
         <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
               [...Array(12)].map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-muted/5 animate-pulse border border-border/10" />
               ))
            ) : events.map((item) => (
               <div key={item.key} className="group p-5 rounded-2xl border border-border/20 bg-muted/5 hover:bg-brand/5 hover:border-brand/30 transition-all cursor-crosshair relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <ChevronRight className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex flex-col gap-1">
                     <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">{item.key}</p>
                     <h3 className="text-xs font-black tracking-tight group-hover:text-brand transition-colors tabular-nums">
                        {item.name}
                     </h3>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/5 flex items-center justify-between">
                     <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Event Enabled</span>
                     </div>
                     <span className="text-[8px] font-bold text-muted-foreground/40 uppercase">Domain Layer</span>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl flex items-center justify-between border-l-4 border-l-brand relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap className="h-32 w-32" />
         </div>
         <div className="relative z-10 space-y-2">
            <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <Info className="h-4 w-4 text-brand" />
               Reactive Architecture Note
            </h4>
            <p className="text-[10px] font-medium leading-relaxed uppercase tracking-widest text-muted-foreground max-w-2xl">
               Events documented here are emitted globally across all service nodes. They trigger asynchronous workflows, analytics aggregation, and real-time socket broadcasts to active clients.
            </p>
         </div>
         <button className="relative z-10 px-6 py-3 bg-brand text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
            Download Payload JSON
         </button>
      </div>
    </div>
  );
}
