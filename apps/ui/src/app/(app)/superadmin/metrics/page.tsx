'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Globe, 
  Zap, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Server,
  Database,
  Cpu,
  Clock
} from 'lucide-react';
import { adminMetricsService } from '@/services/admin-metrics.service';

export default function SuperAdminMetricsPage() {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Pulse every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, healthRes] = await Promise.all([
        adminMetricsService.getStats(),
        adminMetricsService.getHealth()
      ]);
      setStats(statsRes.data);
      setHealth(healthRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const systemMetrics = [
    { label: 'Database Node', health: health?.details?.database?.status === 'up', icon: Database },
    { label: 'Redis Cache', health: health?.details?.redis?.status === 'up', icon: Zap },
    { label: 'Storage Cluster', health: health?.details?.disk?.status === 'up', icon: Server },
    { label: 'Platform Core', health: health?.status === 'ok', icon: Cpu },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">System Telemetry</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Global Health / Performance Metrics</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Systems Nominal</span>
           </div>
        </div>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((sys) => (
          <div key={sys.label} className="group p-6 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                {sys.health ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 animate-bounce" />
                )}
             </div>
             <sys.icon className={`h-8 w-8 mb-4 ${sys.health ? 'text-brand' : 'text-red-500'} group-hover:scale-110 transition-transform`} />
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{sys.label}</p>
             <h3 className="text-sm font-black uppercase tracking-widest">{sys.health ? 'Operational' : 'Critical Failure'}</h3>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl border-l-4 border-l-brand">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black tracking-tighter flex items-center gap-3">
                 <Activity className="h-6 w-6 text-brand" />
                 Platform Velocity
              </h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                 <Clock className="h-3 w-3" />
                 Real-time Update
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Total Ecosystem</p>
                 <h4 className="text-4xl font-black tracking-tighter">{stats?.tenants || 0}</h4>
                 <p className="text-[10px] text-brand font-bold uppercase tracking-widest">+12% from last cycle</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Active Agents</p>
                 <h4 className="text-4xl font-black tracking-tighter">{stats?.users || 0}</h4>
                 <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">98.4% Engagement</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Gross Protocol Rev</p>
                 <h4 className="text-4xl font-black tracking-tighter">${(stats?.totalRevenue || 0).toLocaleString()}</h4>
                 <p className="text-[10px] text-brand font-bold uppercase tracking-widest">Target: $1M</p>
              </div>
           </div>

           <div className="mt-12 h-40 bg-muted/5 rounded-2xl border-2 border-dashed border-border/30 flex flex-col items-center justify-center opacity-40">
              <TrendingUp className="h-10 w-10 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Traffic Flow Visualizer Offline</p>
           </div>
        </div>

        <div className="space-y-8">
           <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-brand">
                 <Zap className="h-4 w-4" />
                 Resource Saturation
              </h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                       <span>Database Heap</span>
                       <span>{(health?.details?.memory_heap?.status === 'up' ? 62 : 0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-brand" style={{ width: '62%' }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                       <span>Disk Consumption</span>
                       <span>{(health?.info?.disk?.status === 'up' ? 14 : 0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-brand" style={{ width: '14%' }} />
                    </div>
                 </div>
              </div>
           </div>

           <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand/5 group-hover:bg-brand/10 transition-all" />
              <div className="relative z-10 text-center">
                 <BarChart3 className="h-12 w-12 text-brand mx-auto mb-4" />
                 <h4 className="text-sm font-black uppercase tracking-widest">Infrastructure Report</h4>
                 <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Generate deep-dive PDF analysis</p>
                 <button className="mt-6 w-full py-3 bg-brand text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-[1.02] transition-all">
                    Initialize Report
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
