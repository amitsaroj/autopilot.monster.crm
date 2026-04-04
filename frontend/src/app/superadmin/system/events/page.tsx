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
  Signal, Radio, Wind, CloudLightning,
  Workflow, ZapOff, ArrowUpRight, BarChart3,
  Network, Share2, Target, Waves
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformEvent {
  id: string;
  name: string;
  payload?: any;
  source: string;
  timestamp: string;
  status: 'DISPATCHED' | 'PROCESSED' | 'FAILED';
}

export default function PlatformEventBusForensicsPage() {
  const [events, setEvents] = useState<PlatformEvent[]>([
     { id: 'EV-8801', name: 'TENANT_PROVISIONED', source: 'Identity-Core', timestamp: new Date().toISOString(), status: 'PROCESSED' },
     { id: 'EV-8802', name: 'PAYMENT_SETTLED', source: 'Monetization-Hub', timestamp: new Date(Date.now() - 60000).toISOString(), status: 'DISPATCHED' },
     { id: 'EV-8803', name: 'WORKFLOW_DIVERGENCE', source: 'Flow-Engine', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'FAILED' },
  ]);
  const [loading, setLoading] = useState(false);

  if (loading) {
     return (
        <div className="flex h-[70vh] items-center justify-center">
           <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
     );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                 Pub/Sub Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Event-Bus-Forensics</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Event Bus Forensics</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Monitor structural Dispatches, systemic Pub/Sub forensics & event Persistence</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group">
              <Radio className="w-4 h-4 text-blue-500 group-hover:animate-ping" /> Live Stream
           </button>
        </div>
      </div>

      {/* Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Event Throughput', value: '412 e/s', icon: Waves, color: 'text-blue-500', bg: 'bg-blue-500/10' },
           { label: 'Platform Pulse', value: 'OPTIMAL', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Dispatch Failures', value: '0.04%', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Integrity Check', value: 'Verified', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
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

      {/* Event Feed */}
      <div className="p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group shadow-inner">
         <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
         
         <div className="flex justify-between items-center mb-10 relative px-2">
            <div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter text-sans leading-none">Systemic Dispatches</h3>
               <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2">Forensics: Event Persistence</p>
            </div>
            <div className="flex gap-4">
               <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-gray-600 hover:text-white transition-all cursor-pointer">
                  <FilterX className="w-5 h-5" />
               </div>
            </div>
         </div>

         <div className="space-y-4 relative max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
            {events.map((ev) => (
              <div key={ev.id} className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/20 transition-all group flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                 <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors" />
                 
                 <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-2xl shrink-0">
                       <Signal className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                       <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-gray-700 uppercase tracking-widest">{ev.id}</span>
                          <h4 className="text-lg font-black text-white uppercase tracking-tight truncate">{ev.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${ev.status === 'PROCESSED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{ev.status}</span>
                       </div>
                       <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest italic flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 opacity-40 shrink-0" /> Source: {ev.source} Node
                       </p>
                    </div>
                 </div>

                 <div className="flex items-center gap-10 shrink-0 text-right">
                    <div className="hidden lg:block">
                       <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1 opacity-60">Persistence</p>
                       <p className="text-[10px] text-gray-500 font-mono italic">STORED_LATTICE_A</p>
                    </div>
                    <div className="w-[120px]">
                       <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1 opacity-60">Timestamp</p>
                       <p className="text-[10px] text-white font-black uppercase tracking-tighter">{new Date(ev.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <button className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-700 hover:text-white transition-all shadow-xl">
                       <Eye className="w-6 h-6" />
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Topology Persistence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[40px] bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl">
               <Network className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Topology Forensics</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Analyze structural pub/sub dispatches. Track systemic event-velocity and topology persistence across global resource clusters.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[40px] bg-purple-500/10 text-purple-500 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl">
               <Share2 className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Dispatch Hub</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Orchestrate high-fidelity event dispatches. Maintain structural connectivity across your platform's geographical node distribution.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
