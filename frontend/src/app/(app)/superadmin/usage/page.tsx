'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  BarChart3, 
  Zap, 
  TrendingUp, 
  Database,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { adminUsageService } from '@/services/admin-usage.service';

export default function SuperAdminUsagePage() {
  const [usage, setUsage] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      setLoading(true);
      const res = await adminUsageService.getSummary();
      setUsage(res.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { label: 'AI Operations', key: 'ai_calls', icon: Zap, color: 'text-yellow-400', unit: 'Tasks' },
    { label: 'Message Flow', key: 'messages', icon: Activity, color: 'text-blue-400', unit: 'Units' },
    { label: 'Cloud Storage', key: 'storage_gb', icon: Database, color: 'text-purple-400', unit: 'GB' },
    { label: 'Worker Load', key: 'executions', icon: Cpu, color: 'text-green-400', unit: 'Worker-s' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Resource Consumption</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Global Telemetry / Usage Analytics</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border/50 text-foreground rounded-xl hover:bg-muted transition-all font-bold text-sm shadow-xl shadow-black/5">
              <TrendingUp className="h-4 w-4" />
              Download Report
           </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="group p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md hover:border-brand/30 transition-all cursor-default">
            <div className={`p-3 w-fit rounded-xl bg-muted/50 mb-4 ${metric.color} group-hover:scale-110 transition-transform`}>
               <metric.icon className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{metric.label}</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black tracking-tighter group-hover:text-brand transition-colors">
                  {loading ? '---' : (usage[metric.key] || 0).toLocaleString()}
               </h3>
               <span className="text-[10px] font-bold text-muted-foreground uppercase">{metric.unit}</span>
            </div>
            <div className="h-1 w-full bg-muted/50 rounded-full mt-6 overflow-hidden">
               <div 
                className="h-full bg-current transition-all duration-1000 opacity-60" 
                style={{ width: loading ? '0%' : '65%', color: 'inherit' }}
               />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Visualization Placeholder */}
      <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tighter flex items-center gap-3">
               <BarChart3 className="h-6 w-6 text-brand" />
               Historical Consumption
            </h2>
            <div className="flex items-center gap-2">
               <button className="px-3 py-1 bg-brand text-white text-[9px] font-black uppercase tracking-widest rounded-md">30 Days</button>
               <button className="px-3 py-1 bg-muted text-muted-foreground text-[9px] font-black uppercase tracking-widest rounded-md hover:bg-muted/80 transition-colors">90 Days</button>
            </div>
         </div>
         
         <div className="h-80 flex flex-col items-center justify-center text-muted-foreground/40 text-sm border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
            <Activity className="h-12 w-12 mb-4 opacity-10 animate-pulse" />
            <p className="font-bold uppercase tracking-widest text-xs">Real-time Telemetry Offline</p>
            <p className="text-[10px] mt-1">Aggregating granular data points for visual rendering</p>
         </div>
      </div>

      {/* Top Consuming Tenants */}
      <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
        <div className="px-8 py-6 border-b border-border/10 bg-muted/10">
           <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              Top Resource Consumers
           </h2>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/20 text-left bg-muted/5">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tenant Profile</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Resource Load</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Cost Impact</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10 font-bold">
            {[1, 2, 3].map((i) => (
              <tr key={i} className="hover:bg-muted/10 transition-colors cursor-pointer group">
                <td className="px-8 py-5">
                   <p className="text-sm font-black tracking-tighter group-hover:text-brand transition-colors">Tenant_Ref_{i}842</p>
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Enterprise Tier</p>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-32 bg-muted/50 rounded-full overflow-hidden">
                         <div className="h-full bg-brand" style={{ width: `${85 - i * 15}%` }} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground/60">{85 - i * 15}%</span>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <p className="text-sm font-black tracking-tighter">${(1240 - i * 200).toLocaleString()}</p>
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Monthly Estimate</p>
                </td>
                <td className="px-8 py-5 text-right font-black uppercase tracking-widest text-green-500 text-[10px]">
                   Stable
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
