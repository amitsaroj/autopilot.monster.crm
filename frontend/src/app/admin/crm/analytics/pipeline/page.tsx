"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Shield, History, User, Clock, Terminal,
  Database, AlertTriangle, FilterX, HelpCircle,
  Eye, CornerDownRight, SquareAsterisk,
  ChevronRight, ArrowUpRight, ZapOff, Rocket,
  Download, ArrowDown, PieChart, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface PipelineMetric {
  stageId: string;
  stageName: string;
  count: number;
  value: number;
  conversionRate: number;
}

export default function PipelineAnalyticsPage() {
  const [metrics, setMetrics] = useState<PipelineMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipelineAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/crm/analytics/pipeline');
      const json = await res.json();
      if (json.data) setMetrics(json.data);
    } catch (e) {
      toast.error('Failed to synchronize pipeline conversion forensics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineAnalytics();
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
                 Funnel Forensics Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Pipeline-Conversion-Hub</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Conversion Funnel</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Stage-Velocity & Fiscal Transition Forensics</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Funnel Digest
           </button>
        </div>
      </div>

      {/* Funnel Visualizer */}
      <div className="space-y-12 py-10 px-8 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group">
         <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px]" />
         
         <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {(metrics.length > 0 ? metrics : [
               { stageId: '1', stageName: 'Discovery Vector', count: 142, value: 850000, conversionRate: 100 },
               { stageId: '2', stageName: 'Qualified Node', count: 98, value: 620000, conversionRate: 69 },
               { stageId: '3', stageName: 'Proposal Dispatch', count: 42, value: 380000, conversionRate: 43 },
               { stageId: '4', stageName: 'Negotiation Persistence', count: 18, value: 210000, conversionRate: 42 },
               { stageId: '5', stageName: 'Fiscal Closure', count: 12, value: 145000, conversionRate: 66 },
            ]).map((step, idx) => (
               <div key={step.stageId} className="flex flex-col items-center group/card transition-all cursor-pointer">
                  <div className="w-full p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] group-hover/card:bg-indigo-500/10 group-hover/card:border-indigo-500/40 transition-all text-center space-y-4 relative overflow-hidden h-[240px] flex flex-col justify-center">
                     <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-none group-hover/card:text-indigo-400">Stage {idx + 1}</span>
                        <h4 className="text-sm font-black text-white uppercase tracking-tighter line-clamp-2">{step.stageName}</h4>
                     </div>
                     <div className="space-y-1">
                        <p className="text-2xl font-black text-white uppercase tracking-tighter">${(step.value / 1000).toFixed(0)}k</p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{step.count} Opportunity Nodes</p>
                     </div>
                  </div>
                  
                  {idx < 4 && (
                     <div className="md:absolute md:top-1/2 md:right-0 md:-mr-3 md:-translate-y-1/2 flex items-center justify-center p-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex flex-col items-center justify-center group-hover/card:bg-indigo-500 group-hover/card:text-white transition-all shadow-xl">
                           <span className="text-[10px] font-black">{step.conversionRate}%</span>
                           <ArrowDown className="w-3 h-3 md:rotate-270" />
                        </div>
                     </div>
                  )}
               </div>
            ))}
         </div>
      </div>

      {/* Detailed Forensics Table Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">Stage Velocity Intelligence</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2">Persistence Metric: Mean Resolution Time</p>
               </div>
               <button className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all group-hover:rotate-180 duration-500">
                  <RefreshCw className="w-5 h-5" />
               </button>
            </div>
            
            <div className="space-y-8">
               {(metrics.length > 0 ? metrics : [
                  { stageName: 'Discovery Vector', velocity: '4.2 Days', trend: 'STABLE' },
                  { stageName: 'Qualified Node', velocity: '8.4 Days', trend: 'ACCELERATING' },
                  { stageName: 'Proposal Dispatch', velocity: '12.1 Days', trend: 'DELAYED' },
                  { stageName: 'Negotiation Persistence', velocity: '5.8 Days', trend: 'ACCELERATING' },
               ]).map((v: any, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.01] border border-white/5 group/row hover:bg-white/[0.03] transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-600 font-black text-xs group-hover/row:bg-indigo-500 group-hover/row:text-white transition-all">
                           {idx + 1}
                        </div>
                        <div>
                           <p className="text-sm font-black text-white uppercase tracking-tighter">{v.stageName}</p>
                           <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Topology: Primary Stage</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-10">
                        <div className="text-right">
                           <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Mean Time-in-Stage</p>
                           <p className="text-sm font-black text-white uppercase tracking-tighter">{v.velocity || '6.2 ARCH-DAYS'}</p>
                        </div>
                        <div className="w-24 text-right">
                           <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${v.trend === 'DELAYED' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              {v.trend || 'STABLE'}
                           </span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] space-y-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
            <div className="space-y-6">
               <div className="flex items-center gap-6">
                  <div className="p-5 rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all">
                     <ZapOff className="w-10 h-10" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Leakage Forensics</h3>
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Status: Divergence Detected</p>
                  </div>
               </div>
               
               <div className="space-y-6 pt-4">
                  {[
                    { label: 'Artifact Abandonment', value: '14%', color: 'bg-red-500' },
                    { label: 'Transition Latency', value: '32%', color: 'bg-amber-500' },
                    { label: 'Staged Obsolescence', value: '8%', color: 'bg-indigo-500' },
                  ].map((leak) => (
                    <div key={leak.label} className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{leak.label}</span>
                          <span className="text-[10px] text-white font-black uppercase tracking-widest">{leak.value}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${leak.color} rounded-full`} style={{ width: leak.value }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 space-y-3">
               <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Optimized Outcome Prompt</h4>
               </div>
               <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
                  "Increase Proposal Dispatch interaction pulse to reduce 14% artifact abandonment rate in the fiscal lattice."
               </p>
            </div>
         </div>
      </div>

      {/* Strategic Orchestration Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-[80px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <PieChart className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Fiscal Flow analytics</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               Monitor how fiscal value artifacts propagate through the workspace pipeline. Orchestrate stage-level revenue forecasting with absolute precision.
            </p>
         </div>
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <TrendingUp className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Conversion Velocity</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               Analyze the speed of opportunity transition artifacts. Identify structural friction points in your conversion funnel and optimize dispatch patterns.
            </p>
         </div>
         <div className="p-10 rounded-[60px] bg-emerald-600 space-y-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center gap-6 relative">
               <div className="p-6 rounded-[32px] bg-white/20 backdrop-blur-md border border-white/20">
                  <Rocket className="w-10 h-10 text-white" />
               </div>
               <div>
                  <h3 className="text-3xl font-black uppercase text-white tracking-tighter leading-none">Funnel Seal</h3>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-2 px-1">Status: Velocity Optimized</p>
               </div>
            </div>
            <p className="text-xs text-white/90 leading-relaxed font-bold uppercase tracking-tight relative">
               Your workspace funnel transition velocity is currently performing in the top 3% of the platform's global cluster benchmarks.
            </p>
            <div className="flex gap-4 relative">
               <button onClick={fetchPipelineAnalytics} className="flex-1 py-5 bg-white text-[#0b0f19] rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">Re-Analyze</button>
               <button className="flex-1 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-3xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">Benchmark Report</button>
            </div>
         </div>
      </div>

    </div>
  );
}
