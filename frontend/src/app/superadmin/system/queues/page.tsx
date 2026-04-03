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
  Repeat, Play, Pause, Square, 
  RotateCcw, ZapOff, Workflow, Signal,
  Microchip, FastForward, Rewind, PlayCircle,
  ShieldAlert, ShieldPlus, AlertOctagon
} from 'lucide-react';
import { toast } from 'sonner';

interface Queue {
  id: string;
  name: string;
  type: string;
  count: number;
  activeCount: number;
  failedCount: number;
  paused: boolean;
  throughput: string;
}

export default function GlobalQueueOrchestratorPage() {
  const [queues, setQueues] = useState<Queue[]>([
     { id: '1', name: 'CRM_CAMPAIGN_QUEUE', type: 'REDIS_BULL', count: 1420, activeCount: 12, failedCount: 42, paused: false, throughput: '124 j/s' },
     { id: '2', name: 'AUDIT_PERSISTENCE_LATTICE', type: 'BULLMQ', count: 88, activeCount: 2, failedCount: 0, paused: false, throughput: '422 j/s' },
     { id: '3', name: 'VOICE_SYNTH_DISPATCH', type: 'REDIS_BULL', count: 4, activeCount: 1, failedCount: 15, paused: true, throughput: '0 j/s' },
     { id: '4', name: 'MARKETPLACE_VERIFICATION', type: 'INTERNAL_JOB', count: 0, activeCount: 0, failedCount: 0, paused: false, throughput: '2 j/m' },
  ]);
  const [loading, setLoading] = useState(false);

  const togglePause = (id: string) => {
     toast.success(`Queue node ${id} state dispatch synchronized`);
  };

  if (loading) {
     return (
        <div className="flex h-[70vh] items-center justify-center">
           <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
     );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                 Platform Engine Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Queue-Orchestrator-Core</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Queue Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Monitor Structural Backlog, Throughput Forensics & Worker Persistence</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group">
              <Plus className="w-4 h-4" /> Provision Worker Node
           </button>
        </div>
      </div>

      {/* Queue Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Platform Backlog', value: queues.reduce((acc, q) => acc + q.count, 0), icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Active Dispatches', value: queues.reduce((acc, q) => acc + q.activeCount, 0), icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Failure artifacts', value: queues.reduce((acc, q) => acc + q.failedCount, 0), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
           { label: 'Engine Persistence', value: '99.8%', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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

      {/* Queue Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {queues.map((queue) => (
           <div key={queue.id} className="p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] hover:border-amber-500/20 transition-all group flex flex-col justify-between h-[420px] relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-amber-500/5 transition-colors" />
              
              <div>
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 rounded-[28px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-2xl">
                       <Repeat className="w-10 h-10" />
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${queue.paused ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          {queue.paused ? 'PAUSED' : 'ACTIVE'}
                       </span>
                       <button className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-gray-600 hover:text-white transition-all">
                          <Settings className="w-5 h-5" />
                       </button>
                    </div>
                 </div>

                 <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight mb-2 leading-none">{queue.name}</h3>
                 <p className="text-[11px] text-gray-600 font-black uppercase tracking-widest opacity-80 flex items-center gap-2 mb-8">
                    <Terminal className="w-3.5 h-3.5 opacity-40 shrink-0" /> {queue.type} Node • Latency Isolation Active
                 </p>

                 <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                    <div>
                       <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1.5 opacity-60">Backlog</p>
                       <p className="text-xl font-black text-white uppercase tracking-tighter">{queue.count}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1.5 opacity-60">Failed</p>
                       <p className="text-xl font-black text-red-500 uppercase tracking-tighter">{queue.failedCount}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1.5 opacity-60">Throughput</p>
                       <p className="text-xl font-black text-emerald-500 uppercase tracking-tighter">{queue.throughput}</p>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-8">
                 <button 
                    onClick={() => togglePause(queue.id)}
                    className="flex-1 py-5 rounded-3xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                 >
                    {queue.paused ? <Play className="w-4 h-4 text-emerald-500" /> : <Pause className="w-4 h-4 text-amber-500" />}
                    {queue.paused ? 'Resume Node' : 'Suspend Node'}
                 </button>
                 <button className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 text-gray-600 hover:text-white transition-all shadow-xl">
                    <RotateCcw className="w-6 h-6" />
                 </button>
                 <button className="p-5 rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                    <Trash2 className="w-6 h-6" />
                 </button>
              </div>
           </div>
         ))}

         {/* Blueprint Placeholder for New Queues */}
         <div className="p-10 rounded-[60px] border border-dashed border-white/10 bg-amber-500/[0.01] flex flex-col items-center justify-center text-center space-y-8 group cursor-pointer hover:border-amber-500/30 transition-all h-[420px]">
            <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-all">
               <Workflow className="w-12 h-12" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight font-sans">Initialize Queue</h3>
               <p className="text-sm text-gray-600 max-w-[240px] mx-auto leading-relaxed mt-3 uppercase tracking-widest font-black opacity-30">Structural Slot: Available</p>
            </div>
            <button className="text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 hover:underline">
               Deploy Queue Dispatch <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* operational persistence Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[40px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl shadow-indigo-500/20">
               <Zap className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">High-Velocity Engine</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Execute structural job dispatches across the platform. Synchronize high-velocity processing artifacts across global resource clusters.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[40px] bg-red-500/10 text-red-400 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl shadow-red-500/20">
               <AlertOctagon className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Dead-Letter Forensics</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Analyze failure artifacts in real-time. Identify structural job divergences and initialize recovery dispatches automatically across the lattice.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
