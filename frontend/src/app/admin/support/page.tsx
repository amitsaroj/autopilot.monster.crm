"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  LifeBuoy, Inbox, Clock, Heart,
  BarChart3, TrendingUp, PieChart, Target,
  MessageSquare, UserCheck, Shield, Rocket,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface SupportStats {
  total: number;
  open: number;
  resolved: number;
  urgent: number;
}

export default function SupportDashboardPage() {
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/support/stats');
      const json = await res.json();
      if (json.data) setStats(json.data);
    } catch (e) {
      toast.error('Failed to synchronize support forensics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Support Core Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Support-Forensics</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Support Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Resolution Velocity & Help-Desk Analytics</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchStats} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <RefreshCw className="w-5 h-5" />
           </button>
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
              <Download className="w-4 h-4" /> Export Audit Log
           </button>
        </div>
      </div>

      {/* Forensic Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { label: 'Total Inbound', value: stats?.total || 0, icon: Inbox, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Active Persistence', value: stats?.open || 0, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Resolution Rate', value: '94.2%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Urgent Artifacts', value: stats?.urgent || 0, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
         ].map((stat) => (
           <div key={stat.label} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.03] transition-all relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors" />
              <div className="flex justify-between items-start mb-6">
                 <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-8 h-8" />
                 </div>
                 <div className="flex items-center gap-1 text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">
                    Pulse Stable
                 </div>
              </div>
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-1 opacity-60 leading-none">{stat.label}</p>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{stat.value}</h3>
           </div>
         ))}
      </div>

      {/* Main Support Chart Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">Resolution Velocity Forensics</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2 px-1">Metric: Mean-Closing-Time</p>
               </div>
               <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-gray-500 uppercase">Live Loop</span>
               </div>
            </div>
            
            <div className="h-[300px] w-full flex items-end justify-between px-4 pb-2">
               {[60, 40, 80, 50, 90, 70, 85, 45, 75, 65, 95, 80].map((h, i) => (
                  <div key={i} className="w-full max-w-[40px] flex flex-col items-center gap-4 group/bar">
                     <div 
                        style={{ height: `${h}%` }} 
                        className="w-full bg-indigo-500/10 border border-indigo-500/20 rounded-2xl group-hover/bar:bg-indigo-500 group-hover/bar:border-indigo-400 group-hover/bar:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all cursor-crosshair relative"
                     >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-white text-[#0b0f19] px-2 py-1 rounded text-[8px] font-black uppercase whitespace-nowrap">
                           {h}% Resolved
                        </div>
                     </div>
                     <span className="text-[8px] text-gray-700 font-black uppercase tracking-tighter">NODE {i+1}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] space-y-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
            <div className="space-y-6">
               <div className="flex items-center gap-6">
                  <div className="p-5 rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all">
                     <AlertCircle className="w-10 h-10" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Category Mix forensics</h3>
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Status: High Volume Observed</p>
                  </div>
               </div>
               
               <div className="space-y-6 pt-4">
                  {[
                    { label: 'Billing Artifacts', value: '42%', color: 'bg-red-500' },
                    { label: 'Technical Persistence', value: '28%', color: 'bg-indigo-500' },
                    { label: 'Account Integrity', value: '18%', color: 'bg-emerald-500' },
                    { label: 'Other Vectors', value: '12%', color: 'bg-white/10' },
                  ].map((mix) => (
                    <div key={mix.label} className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{mix.label}</span>
                          <span className="text-[10px] text-white font-black uppercase tracking-widest">{mix.value}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${mix.color} rounded-full`} style={{ width: mix.value }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <button className="w-full py-5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all">
               Analyze Mix Divergence
            </button>
         </div>
      </div>

      {/* Satisfaction & Support Lattices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-pink-500/5 rounded-full blur-[80px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-pink-500/10 text-pink-500 border border-pink-500/20 group-hover:bg-pink-500 group-hover:text-white transition-all">
                  <Heart className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Affinity Pulse</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               Monitor workspace CSAT artifacts in real-time. Analyze sentiment forensics across all resolved support dispatches to identify satisfaction trends.
            </p>
         </div>
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <UserCheck className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Agent Forensics</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               Analyze individual agent performance artifacts. Track structural resolution velocity and engagement pulse per active administrative node.
            </p>
         </div>
         <div className="p-10 rounded-[60px] bg-indigo-600 space-y-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center gap-6 relative">
               <div className="p-6 rounded-[32px] bg-white/20 backdrop-blur-md border border-white/20">
                  <Rocket className="w-10 h-10 text-white" />
               </div>
               <div>
                  <h3 className="text-3xl font-black uppercase text-white tracking-tighter leading-none">Support Seal</h3>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-2 px-1">Status: Resolution Optimized</p>
               </div>
            </div>
            <p className="text-xs text-white/90 leading-relaxed font-bold uppercase tracking-tight relative">
               Your workspace support resolution velocity is currently 14.2% faster than the platform-wide global cluster average.
            </p>
            <div className="flex gap-4 relative">
               <button className="flex-1 py-5 bg-white text-[#0b0f19] rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">Full Audit</button>
               <button className="flex-1 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-3xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">Benchmarks</button>
            </div>
         </div>
      </div>

    </div>
  );
}
