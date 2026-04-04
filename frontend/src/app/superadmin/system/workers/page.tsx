"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  Shield, History, User, Clock, Terminal,
  Database, AlertTriangle, FilterX, HelpCircle,
  Eye, CornerDownRight, SquareAsterisk,
  Microchip, HardDrive, Thermometer,
  CloudLightning, ZapOff, Workflow, Signal,
  Binary, Box, BoxSelect, Boxes, 
  Cpu as Processor, Radio, RadioReceiver
} from 'lucide-react';
import { toast } from 'sonner';

interface Worker {
  id: string;
  name: string;
  hostname: string;
  status: 'ACTIVE' | 'IDLE' | 'ZOMBIE';
  cpuUsage: number;
  memoryUsage: number;
  tasksProcessed: number;
  uptime: string;
}

export default function GlobalWorkerClusterPage() {
  const [workers, setWorkers] = useState<Worker[]>([
     { id: 'W-01', name: 'Main-Orchestrator-Node', hostname: 'host-a-primary', status: 'ACTIVE', cpuUsage: 42, memoryUsage: 1.2, tasksProcessed: 14205, uptime: '14d 2h' },
     { id: 'W-02', name: 'Voice-Dispatch-Worker', hostname: 'host-b-voice', status: 'ACTIVE', cpuUsage: 88, memoryUsage: 4.8, tasksProcessed: 890, uptime: '2d 6h' },
     { id: 'W-03', name: 'Audit-Forensics-Node', hostname: 'host-c-log', status: 'IDLE', cpuUsage: 2, memoryUsage: 0.4, tasksProcessed: 42200, uptime: '48d 0h' },
  ]);
  const [loading, setLoading] = useState(false);

  if (loading) {
     return (
        <div className="flex h-[70vh] items-center justify-center">
           <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
     );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                 Mechanical Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Worker-Cluster-Orchestrator</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Worker Cluster Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Monitor Structural consumption, node behavior Forensics & systemic execution dispatches</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group">
              <Plus className="w-4 h-4" /> Provision Worker node
           </button>
        </div>
      </div>

      {/* Cluster Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Active Processors', value: workers.length, icon: Processor, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Cluster Throughput', value: '1.4k t/s', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Temporal Stability', value: 'High', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
           { label: 'Node Persistence', value: 'Verified', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
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

      {/* Worker Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {workers.map((worker) => (
           <div key={worker.id} className="p-12 rounded-[60px] bg-white/[0.01] border border-white/[0.05] hover:border-emerald-500/20 transition-all group flex flex-col justify-between h-[500px] relative overflow-hidden shadow-inner">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/[0.01] rounded-full blur-[100px] group-hover:bg-emerald-500/5 transition-colors shadow-2xl" />
              
              <div>
                 <div className="flex justify-between items-start mb-10">
                    <div className="w-20 h-20 rounded-[35px] bg-white/[0.03] border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-2xl">
                       <Microchip className="w-10 h-10" />
                    </div>
                    <div className="flex gap-4">
                       <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${worker.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                          {worker.status}
                       </span>
                       <button className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 text-gray-600 hover:text-white transition-all">
                          <Settings className="w-6 h-6" />
                       </button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none group-hover:text-emerald-400 transition-colors">{worker.name}</h3>
                    <p className="text-[12px] text-gray-600 font-mono italic uppercase tracking-tighter flex items-center gap-2">
                       <Globe className="w-4 h-4 opacity-40 shrink-0" /> {worker.hostname} • {worker.id} Node
                    </p>
                 </div>
              </div>

              <div className="space-y-10 pt-10 border-t border-white/5">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <div className="flex justify-between text-[11px] text-gray-700 font-black uppercase tracking-widest px-1">
                          <span>CPU Artifact</span>
                          <span className={worker.cpuUsage > 80 ? 'text-red-500' : 'text-emerald-400'}>{worker.cpuUsage}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full ${worker.cpuUsage > 80 ? 'bg-red-500' : 'bg-emerald-500'} rounded-full transition-all duration-1000`} style={{ width: `${worker.cpuUsage}%` }} />
                       </div>
                    </div>
                    <div className="space-y-4 text-right">
                       <p className="text-[11px] text-gray-700 font-black uppercase tracking-widest mb-1.5 opacity-60 leading-none">Task Persistence</p>
                       <p className="text-2xl font-black text-white uppercase tracking-tighter italic">{worker.tasksProcessed.toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="flex-1 py-6 rounded-[32px] bg-white text-[#0b0f19] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/10">
                       Initialize Core rebalance
                    </button>
                    <button className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 text-gray-600 hover:text-red-400 transition-all shadow-xl">
                       <ZapOff className="w-7 h-7" />
                    </button>
                 </div>
              </div>
           </div>
         ))}

         {/* Blueprint Placeholder for New Workers */}
         <div className="p-12 rounded-[60px] border border-dashed border-white/10 bg-emerald-500/[0.01] flex flex-col items-center justify-center text-center space-y-10 group cursor-pointer hover:border-emerald-500/30 transition-all h-[500px]">
            <div className="w-28 h-28 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all shadow-inner">
               <Boxes className="w-14 h-14" />
            </div>
            <div>
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight font-sans">Initialize Executor</h3>
               <p className="text-sm text-gray-600 max-w-[280px] mx-auto leading-relaxed mt-4 uppercase tracking-widest font-black opacity-30 italic leading-none">Structural Slot: Available</p>
            </div>
            <button className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3 hover:underline">
               Deploy Worker Dispatch <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Cluster Persistence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[45px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl">
               <Binary className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Binary Forensics</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80 pt-2">
                  Analyze structural executor dispatches. Monitor binary consumption dispatches across global resource nodes in real-time.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[45px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl">
               <RadioReceiver className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Mechanical Pulse</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80 pt-2">
                  Maintain global mechanical persistence. Synchronize high-velocity processing artifacts across theoretical hardware clusters.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
