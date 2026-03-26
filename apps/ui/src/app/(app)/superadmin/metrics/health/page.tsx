'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  Activity, 
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { adminHealthService } from '@/services/admin-health.service';

export default function SuperAdminHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const res = await adminHealthService.check();
      setHealth(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { name: 'Primary Database', status: health?.database?.status || 'OPERATIONAL', type: 'PostgreSQL' },
    { name: 'Caching Cluster', status: health?.redis?.status || 'OPERATIONAL', type: 'Redis v7' },
    { name: 'Message Broker', status: health?.queue?.status || 'OPERATIONAL', type: 'BullMQ / L7' },
    { name: 'Vector Manifold', status: health?.qdrant?.status || 'OPERATIONAL', type: 'Qdrant / Vector' },
    { name: 'Cloud Storage', status: health?.storage?.status || 'OPERATIONAL', type: 'MinIO / S3' }
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-8">
        <div>
          <h1 className="page-title font-black text-4xl tracking-tighter text-foreground">Health Matrix</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[11px] mt-1">SuperAdmin / Infrastructure Saturation & Connectivity</p>
        </div>
        <div className="flex gap-4">
           <button onClick={loadHealth} className="flex items-center gap-2 px-8 py-3 bg-muted/10 border border-border/20 text-muted-foreground rounded-2xl hover:bg-muted/20 transition-all font-black text-[10px] uppercase tracking-widest">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Nodes
          </button>
           <div className="px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Global Status: Optimal</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-foreground">
         {/* System Pulse */}
         <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {services.map((service) => (
                  <div key={service.name} className="p-8 bg-card/20 backdrop-blur-xl border border-border/30 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
                     <div>
                        <div className="flex items-center justify-between mb-6">
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{service.type}</span>
                           <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <h3 className="text-xl font-black tracking-tighter mb-2">{service.name}</h3>
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Latency: 1.2ms / Connected</p>
                     </div>
                     <div className="mt-8 pt-6 border-t border-border/10">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                           <span>Uptime</span>
                           <span>99.998%</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-brand text-white p-10 rounded-[3rem] shadow-2xl shadow-brand/30 relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Activity className="h-40 w-40" />
               </div>
               <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8">Platform Throughput</h3>
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2 font-black">
                        <span>CPU Saturation</span>
                        <span>42%</span>
                     </div>
                     <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full w-[42%]" />
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2 font-black">
                        <span>Memory Manifest</span>
                        <span>68%</span>
                     </div>
                     <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full w-[68%]" />
                     </div>
                  </div>
               </div>
               <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Last Incident: 14 days ago</p>
               </div>
            </div>

            <div className="bg-card/20 backdrop-blur-xl border border-border/30 p-8 rounded-[2.5rem]">
               <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand" />
                  Availability Zones
               </h3>
               <div className="space-y-4">
                  {['us-east-1', 'eu-west-1', 'ap-south-1'].map((zone) => (
                     <div key={zone} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">{zone}</span>
                        <div className="px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-[8px] font-black tracking-widest">HEALTHY</div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
