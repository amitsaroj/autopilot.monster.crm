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
  DollarSign, ArrowUpRight, ArrowDownRight,
  MousePointer2, UserPlus, ZapOff, Rocket,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsSummary {
  contactsCount: number;
  dealsValue: number;
  activeCampaigns: number;
  conversionRate: number;
  revenuePulse: number[];
}

export default function CRMAnalyticsSummaryPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/crm/analytics/summary');
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch (e) {
      toast.error('Failed to synchronize CRM performance forensics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
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
                 Forensic Engine Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Analytic-Core</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Performance Summary</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Data Visuals & Strategic Fiscal Intelligence</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-2xl">
              <button className="px-5 py-2 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all">Real-time</button>
              <button className="px-5 py-2 rounded-xl text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">7 Days</button>
              <button className="px-5 py-2 rounded-xl text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">30 Days</button>
           </div>
           <button className="p-3 bg-white text-[#0b0f19] rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
              <Download className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Persistence Forensics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { label: 'Lead Velocity', value: '4.2k', trend: '+12.4%', icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Fiscal Pipeline', value: '$2.8M', trend: '+8.2%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Conversion Pulse', value: '18.4%', trend: '+2.1%', icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Engagement Rate', value: '42%', trend: '-1.4%', icon: Activity, color: 'text-red-500', bg: 'bg-red-500/10' },
         ].map((stat) => (
           <div key={stat.label} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.03] transition-all relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors" />
              <div className="flex justify-between items-start mb-6">
                 <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-8 h-8" />
                 </div>
                 <div className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                    {stat.trend} {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                 </div>
              </div>
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-1 opacity-60 leading-none">{stat.label}</p>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{stat.value}</h3>
           </div>
         ))}
      </div>

      {/* Main Forensic Chart Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">Revenue Trajectory artifact</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2">Fiscal Persistence: Synchronized</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                     <div className="w-2 h-2 rounded-full bg-indigo-500" /> Projected
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                     <div className="w-2 h-2 rounded-full bg-white/20" /> Historical
                  </div>
               </div>
            </div>
            {/* Chart Placeholder */}
            <div className="h-[300px] w-full flex items-end gap-3 px-4">
               {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85, 70, 90].map((h, i) => (
                  <div key={i} className="flex-1 space-y-2 group/bar">
                     <div className="h-[250px] w-full flex items-end">
                        <div 
                           style={{ height: `${h}%` }} 
                           className="w-full bg-white/[0.03] border border-white/5 rounded-2xl group-hover/bar:bg-indigo-500 group-hover/bar:border-indigo-400 group-hover/bar:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer relative"
                        >
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity px-3 py-1 bg-white text-[#0b0f19] rounded-lg text-[9px] font-black uppercase whitespace-nowrap">
                              NODE {i+1}: {h}k
                           </div>
                        </div>
                     </div>
                     <p className="text-[8px] text-gray-700 font-black text-center uppercase tracking-tighter">PHASE {i+1}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] space-y-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
            <div className="space-y-6">
               <div className="flex items-center gap-6">
                  <div className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                     <PieChart className="w-10 h-10" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Channel Mix forensics</h3>
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Status: Active Analysis</p>
                  </div>
               </div>
               
               <div className="space-y-6 pt-4">
                  {[
                    { label: 'Email Outreach', value: '52%', color: 'bg-indigo-500' },
                    { label: 'WhatsApp Nodes', value: '28%', color: 'bg-emerald-500' },
                    { label: 'SMS Lattices', value: '12%', color: 'bg-amber-500' },
                    { label: 'Other Vectors', value: '8%', color: 'bg-white/20' },
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

            <button className="w-full py-5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all">
               Deep-Dive Mix Analysis
            </button>
         </div>
      </div>

      {/* Intelligence & Prediction Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-[80px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <BarChart3 className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Velocity Predictor</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               Utilize platform-wide predictive forensics to forecast lead transition velocity and deal closure probability artifacts for the next fiscal phase.
            </p>
         </div>
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Activity className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Anomoly Forensics</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               Monitor lead funnel leakage and communication latency artifacts in real-time. Automatically flag structural performance deviations in your growth lattice.
            </p>
         </div>
         <div className="p-10 rounded-[60px] bg-indigo-600 to-purple-800 text-white space-y-10 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center gap-6">
               <div className="p-6 rounded-[32px] bg-white/20 backdrop-blur-md border border-white/20">
                  <Rocket className="w-10 h-10 text-white" />
               </div>
               <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Strategic Pulse</h3>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-2">Status: Optimized Growth</p>
               </div>
            </div>
            <p className="text-sm text-white/90 leading-relaxed font-bold uppercase tracking-tight">
               Your workspace performance artifacts are currently performing in the top 5% of the platform's global cluster analysis.
            </p>
            <div className="flex gap-4">
               <button className="flex-1 py-5 bg-white text-[#0b0f19] rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">Full Audit</button>
               <button className="flex-1 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-3xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">Benchmarks</button>
            </div>
         </div>
      </div>

    </div>
  );
}
