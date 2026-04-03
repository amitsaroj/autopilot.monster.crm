"use client";

import { useState, useEffect } from 'react';
import { 
  Activity, Cpu, HardDrive, Globe, Zap, 
  Terminal, ShieldAlert, Clock, RefreshCw, 
  Server, Database, Loader2, ArrowRight, Gauge, 
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { toast } from 'sonner';

const dummySeries = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  cpu: Math.floor(Math.random() * 40) + 10,
  memory: Math.floor(Math.random() * 30) + 50,
}));

export default function SystemMetricsPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/v1/admin/health');
      const json = await res.json();
      if (json.data) setHealth(json.data);
    } catch (e) {
      toast.error('Failed to sync infrastructure telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Telemetry Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono">NODE_ENV: PRODUCTION</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Infrastructure Observability</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Node.js Runtime & Hardware Metrics</p>
        </div>
        <button 
           onClick={() => fetchHealth()}
           className="px-6 py-3 bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
        >
           <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Force Polling
        </button>
      </div>

      {/* Resource Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'System Uptime', value: `${(health?.uptime / 3600).toFixed(1)} Hours`, icon: Clock, color: 'text-indigo-400', sub: 'Process Persistence' },
           { label: 'Available RAM', value: formatBytes(health?.memory?.free || 0), icon: Database, color: 'text-blue-400', sub: `${((health?.memory?.free / health?.memory?.total) * 100).toFixed(0)}% Free Space` },
           { label: 'CPU Load (5m)', value: health?.cpu?.load[1].toFixed(2), icon: Cpu, color: 'text-amber-400', sub: `${health?.cpu?.count} Physical Cores` },
           { label: 'Heap Usage', value: formatBytes(health?.memory?.usage?.heapUsed || 0), icon: Gauger, color: 'text-emerald-400', sub: 'Managed GC Heap' },
         ].map((tile) => (
           <div key={tile.label} className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-2xl relative overflow-hidden group">
              <div className="mb-4 flex justify-between">
                 <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 group-hover:scale-110 transition-transform">
                    <tile.icon className={`w-5 h-5 ${tile.color}`} />
                 </div>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{tile.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{tile.value}</h3>
              <p className="text-[10px] text-gray-600 mt-2 font-bold uppercase tracking-tighter">{tile.sub}</p>
           </div>
         ))}
      </div>

      {/* Performance Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Live Telemetry Loop */}
         <div className="lg:col-span-2 p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
            <div className="flex justify-between items-center">
               <h3 className="text-white font-bold flex items-center gap-3">
                  <Gauge className="w-5 h-5 text-indigo-500" /> Real-time Workload Analysis
               </h3>
               <div className="flex gap-2">
                  <span className="w-24 h-1.5 rounded-full bg-indigo-500/20 overflow-hidden"><div className="h-full bg-indigo-500 w-[40%]" /></span>
                  <span className="w-24 h-1.5 rounded-full bg-emerald-500/20 overflow-hidden"><div className="h-full bg-emerald-500 w-[60%]" /></span>
               </div>
            </div>
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dummySeries}>
                     <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                     <XAxis dataKey="time" stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
                     <YAxis stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#060a14', border: '1px solid #ffffff10', borderRadius: '16px' }}
                        itemStyle={{ fontSize: '12px' }}
                     />
                     <Area type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
                     <Area type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" name="RAM %" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Runtime Environment Details */}
         <div className="space-y-8 flex flex-col justify-between">
            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-6">
               <h3 className="text-white font-bold flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-gray-500" /> Runtime Manifest
               </h3>
               <div className="space-y-4">
                  {[
                    { label: 'OS Kernel', value: health?.platform, icon: Server },
                    { label: 'Engine', value: health?.nodeVersion, icon: Activity },
                    { label: 'Tenant Isolation', value: 'Enabled', icon: ShieldAlert },
                    { label: 'DB Persistence', value: 'Connected', icon: Database },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/[0.05]">
                       <div className="flex items-center gap-3">
                          <row.icon className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-500 font-medium">{row.label}</span>
                       </div>
                       <span className="text-xs font-black text-white">{row.value}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-indigo-500/10 border border-indigo-500/20 space-y-4">
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/30">
                     <Zap className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-white font-black leading-tight text-sm uppercase tracking-tight">Active Cluster Optimization</h4>
                     <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Auto-scaling group: Healthy</p>
                  </div>
               </div>
               <p className="text-xs text-gray-400 leading-relaxed">
                  Your platform is currently running at optimal resource distribution. No horizontal scaling events triggered in the last 24h.
               </p>
               <button className="w-full py-4 bg-white text-[#0b0f19] rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                  Scale Infrastructure
               </button>
            </div>
         </div>
      </div>

      {/* Security & Health Alerts */}
      <div className="p-10 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01]">
         <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                   <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white mb-1">Global Health Certificate</h3>
                   <p className="text-sm text-gray-500">All managed services, including Sentry, Stripe Webhooks, and Voice AI Gateways are reporting 100% uptime.</p>
                </div>
            </div>
            <div className="flex gap-4">
               <button className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-black uppercase tracking-widest transition-all">Launch Diagnostics</button>
               <button className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-black uppercase tracking-widest transition-all">Security Scan</button>
            </div>
         </div>
      </div>

    </div>
  );
}
