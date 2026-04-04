"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  BarChart3, TrendingUp, PieChart, Target,
  Gauge, Network, Database, Terminal,
  Shield, Rocket, Radio, Signal,
  Microchip, HardDrive, Thermometer,
  CloudLightning, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function PlatformTelemetryDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([
     { id: 'NODE-01', name: 'Identity Cluster A', load: 42, temp: 38, status: 'OPTIMAL' },
     { id: 'NODE-02', name: 'CRM LATTICE B', load: 88, temp: 52, status: 'HIGH_LOAD' },
     { id: 'NODE-03', name: 'OUTREACH-HUB', load: 15, temp: 32, status: 'IDLE' },
  ]);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      // Mocked high-fidelity telemetry dispatches
      await new Promise(r => setTimeout(r, 1000));
      setLoading(false);
    } catch (e) {
      toast.error('Failed to synchronize global telemetry dispatches');
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  if (loading) {
     return (
        <div className="flex h-[70vh] items-center justify-center">
           <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
     );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Global Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Platform-Telemetry-Core</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Platform Telemetry</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Structural Health, Latency Forensics & Global Resource Persistence</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchTelemetry} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <RefreshCw className="w-5 h-5" />
           </button>
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group hover:scale-105 active:scale-95">
              <Radio className="w-4 h-4 text-indigo-500 group-hover:animate-pulse" /> Live Dispatch
           </button>
        </div>
      </div>

      {/* Global Health Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Uptime Persistence', value: '99.99%', icon: Signal, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'API Throughput', value: '14.2k/s', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Global Latency', value: '24ms', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Integrity Check', value: 'Verified', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
         ].map((stat) => (
           <div key={stat.label} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.03] transition-all relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors" />
              <div className="flex justify-between items-start mb-6">
                 <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-2xl`}>
                    <stat.icon className="w-8 h-8" />
                 </div>
              </div>
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-1 opacity-60 leading-none">{stat.label}</p>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{stat.value}</h3>
           </div>
         ))}
      </div>

      {/* Cluster Forensics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group shadow-inner">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">Node Performance Matrix</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2 px-1">Forensics: Structural Consumption</p>
               </div>
            </div>
            
            <div className="space-y-8">
               {nodes.map((node) => (
                  <div key={node.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all group/item flex items-center justify-between">
                     <div className="flex items-center gap-8 flex-1">
                        <div className={`p-5 rounded-3xl ${node.status === 'HIGH_LOAD' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'} group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all`}>
                           <Server className="w-10 h-10" />
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-xl font-black text-white uppercase tracking-tight truncate mb-1">{node.name}</h4>
                           <p className="text-[10px] text-gray-600 font-mono italic uppercase tracking-tighter">{node.id} • Latent Execution Node</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-12 shrink-0 text-right">
                        <div>
                           <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1.5 opacity-60">CPU Load</p>
                           <div className="flex items-center gap-3">
                              <span className={`text-xl font-black ${node.load > 85 ? 'text-red-500' : 'text-indigo-400'}`}>{node.load}%</span>
                              <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                 <div className={`h-full ${node.load > 85 ? 'bg-red-500' : 'bg-indigo-500'} rounded-full`} style={{ width: `${node.load}%` }} />
                              </div>
                           </div>
                        </div>
                        <div className="hidden md:block">
                           <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1.5 opacity-60">Temperature</p>
                           <p className="text-xl font-black text-white uppercase tracking-tighter">{node.temp}°C</p>
                        </div>
                        <button className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-700 hover:text-white transition-all">
                           <Settings className="w-6 h-6" />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] space-y-10 group relative overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
            <div className="space-y-6">
               <div className="flex items-center gap-6">
                  <div className="p-5 rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all">
                     <AlertTriangle className="w-10 h-10" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">System Divergence</h3>
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Audit: Structural Alerts</p>
                  </div>
               </div>

               <div className="space-y-6 pt-4">
                  {[
                    { label: 'DB Connections Persistence', value: '82%', color: 'bg-emerald-500' },
                    { label: 'Network Packet Persistence', value: '98%', color: 'bg-indigo-500' },
                    { label: 'Memory Pressure Pulse', value: '42%', color: 'bg-amber-500' },
                    { label: 'Cache Hit Lattices', value: '94%', color: 'bg-blue-500' },
                  ].map((mix) => (
                    <div key={mix.label} className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{mix.label}</span>
                          <span className="text-[10px] text-white font-black uppercase tracking-widest">{mix.value}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${mix.color} rounded-full transition-all duration-1000`} style={{ width: mix.value }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-red-500 to-orange-800 text-white space-y-4 shadow-2xl shadow-red-500/20 relative overflow-hidden group/alert">
               <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover/alert:scale-150 transition-transform" />
               <div className="flex items-center gap-4">
                  <CloudLightning className="w-8 h-8" />
                  <h4 className="text-lg font-black uppercase tracking-tighter leading-none text-sans">Critical Pulse</h4>
               </div>
               <p className="text-xs text-white/80 leading-relaxed font-bold uppercase tracking-tight">
                  Node persistence locked. High divergence detected on Cluster B. Initialize structural rebalancing protocol immediately.
               </p>
               <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">
                  Initialize Rebalance
               </button>
            </div>
         </div>
      </div>

      {/* Global Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-[80px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Database className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Persistence Forensics</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium uppercase tracking-tight opacity-80 mt-4">
               Monitor database persistence artifacts in real-time. Analyze systemic write-velocity and storage durability dispatches globally.
            </p>
         </div>
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Network className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Topology Pulse</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium uppercase tracking-tight opacity-80 mt-4">
               Inspect network topology persistence. Track systemic packet-velocity across the global administrative lattice to ensure absolute connectivity.
            </p>
         </div>
         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/5 space-y-8 group hover:bg-white/[0.01] transition-all relative overflow-hidden shadow-2xl">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/5 rounded-full blur-[80px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-purple-500/10 text-purple-500 border border-purple-500/20 group-hover/btn:bg-purple-500 group-hover/btn:text-white transition-all">
                  <Terminal className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none text-sans">Shell Orchestrator</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium uppercase tracking-tight opacity-80">
               Execute administrative structural dispatches directly via platform shell artifacts. Critical status monitoring enabled.
            </p>
            <button className="w-full py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white tracking-widest hover:bg-white/5 transition-all">
               Initialize Shell Node
            </button>
         </div>
      </div>

    </div>
  );
}
