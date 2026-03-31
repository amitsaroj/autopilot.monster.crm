'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Search, 
  Filter, 
  Clock,
  Terminal,
  Activity,
  Layers,
  Cpu,
  ShieldCheck,
  RefreshCw,
  MoreVertical,
  Play
} from 'lucide-react';
import { adminEventsService } from '@/services/admin-events.service';

export default function SuperAdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await adminEventsService.findAll();
      setEvents(res.data || []);
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
          <h1 className="page-title font-black text-3xl tracking-tighter text-foreground">Event Protocol</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">SuperAdmin / Domain Event Registry & Replay</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-3">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest text-foreground">Reactive Broker: Operational</span>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-border/30 text-foreground">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Search by event name, origin, or payload..."
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-transparent focus:border-brand/40 focus:bg-background/80 rounded-xl transition-all outline-none text-sm font-bold"
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/50 transition-colors">
              <Filter className="h-4 w-4 text-muted-foreground" />
           </button>
           <div className="h-6 w-px bg-border/40 mx-1" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">{events.length} Domain Events Persisted</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 font-mono">
         {loading ? (
            [...Array(6)].map((_, i) => (
               <div key={i} className="h-16 bg-card/10 border border-border/20 rounded-2xl animate-pulse" />
            ))
         ) : events.length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-border/20 rounded-[4rem] bg-card/5">
               <Activity className="h-16 w-16 mx-auto mb-6 text-muted-foreground/20" />
               <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40 font-sans">No Domain Propagation Detected</p>
            </div>
         ) : (
            events.map((event) => (
               <div key={event.id} className="p-5 bg-card/20 backdrop-blur-xl border border-border/30 rounded-2xl flex items-center justify-between group hover:border-brand/40 transition-all shadow-xl shadow-black/5">
                  <div className="flex items-center gap-6">
                     <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                        <Zap className="h-5 w-5" />
                     </div>
                     <div>
                        <div className="flex items-center gap-3">
                           <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{event.eventName}</h3>
                           <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest italic">{new Date(event.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest">{event.origin || 'PLATFORM_CORE'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <button className="p-2 rounded-lg hover:bg-brand/10 text-muted-foreground hover:text-brand transition-all border border-transparent hover:border-brand/20 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                        <Play className="h-3 w-3" />
                        Replay
                     </button>
                     <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                     </button>
                  </div>
               </div>
            ))
         )}
      </div>
    </div>
  );
}
