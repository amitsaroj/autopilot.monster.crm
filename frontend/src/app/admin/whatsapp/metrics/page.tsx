"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, CheckCircle2, MessageSquare, AlertCircle, Clock, Zap, Download, RefreshCw, Smartphone, Phone, Mail, UserPlus, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function WhatsAppMetricsPage() {
  const [loading, setLoading] = useState(false);

  const stats = [
    { label: "Total Transmissions", value: "45.2K", change: "+12.5%", trending: "up", color: "text-emerald-400" },
    { label: "Delivery Success", value: "98.4%", change: "+0.2%", trending: "up", color: "text-blue-400" },
    { label: "Mean Read Rate", value: "72.1%", change: "-2.1%", trending: "down", color: "text-amber-400" },
    { label: "Convergent Responses", value: "12.8%", change: "+4.5%", trending: "up", color: "text-violet-400" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                 Analytics Layer Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Telemetric Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Comprehensive performance metrics for multi-channel WhatsApp engagement</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-6 py-3 bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Download Artifact
           </button>
           <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 group">
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-all" /> Synchronize Stream
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((s) => (
           <div key={s.label} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-emerald-500/5 transition-colors pointer-events-none" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">{s.label}</p>
              <div className="flex items-baseline gap-3">
                 <h2 className={cn("text-4xl font-black tracking-tighter", s.color)}>{s.value}</h2>
                 <span className={cn("text-[10px] font-black uppercase flex items-center gap-1", s.trending === "up" ? "text-emerald-500" : "text-red-500")}>
                    {s.trending === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                    {s.change}
                 </span>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group min-h-[400px] flex flex-col items-center justify-center">
            <BarChart3 className="w-20 h-20 text-gray-800 mb-6 opacity-20" />
            <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest italic">Transmission Velocity Visualization Node</h3>
            <p className="text-[10px] text-gray-700 font-bold uppercase mt-2 tracking-tighter">Wait for telemetry stream to initialize...</p>
         </div>

         <div className="lg:col-span-1 p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl space-y-8">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
               <Zap className="w-6 h-6 text-amber-500" /> Dynamic Health
            </h2>
            <div className="space-y-6">
               <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway Node A</span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Latent: 12ms</span>
               </div>
               <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway Node B</span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Latent: 15ms</span>
               </div>
               <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-amber-500" />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Backup Cluster</span>
                  </div>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Standby</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
