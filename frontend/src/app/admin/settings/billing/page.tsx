"use client";

import { useState } from "react";
import { CreditCard, Zap, CheckCircle2, Package, History, DollarSign, Download, ArrowUpRight, ShieldCheck, BadgeCheck, AlertCircle, RefreshCw, Save, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const plan = {
    name: "Enterprise Core",
    price: 499,
    status: "ACTIVE",
    expiry: "2026-12-31",
    limits: [
      { name: "MAUs (Active Users)", used: 450, total: 1000, color: "bg-indigo-500" },
      { name: "Storage Volume", used: 12, total: 50, unit: "GB", color: "bg-emerald-500" },
      { name: "AI Token Quota", used: 2.1, total: 5, unit: "M", color: "bg-amber-500" },
    ]
  };

  const invoices = [
    { id: "INV-001", date: "2025-01-01", amount: 499, status: "PAID" },
    { id: "INV-002", date: "2025-02-01", amount: 499, status: "PAID" },
    { id: "INV-003", date: "2025-03-01", amount: 499, status: "PAID" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white/[0.02] p-8 rounded-[40px] border border-white/[0.05] backdrop-blur-md">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                 Capital Layer Active
              </span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Fiscal Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 font-bold uppercase tracking-widest">Manage tenant subscription cycles, usage vectors, and billing artifacts</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
              Upgrade Vector
           </button>
           <button className="px-10 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-500/20 flex items-center gap-2 group">
              <CreditCard className="w-4 h-4 group-hover:scale-110 transition-all font-black text-xl" />
              Manage Gateway
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Current Plan Card */}
        <div className="lg:col-span-1 p-10 rounded-[50px] bg-gradient-to-br from-indigo-600 to-indigo-900 border border-white/10 shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50" />
           <div className="relative z-10 space-y-8 text-white">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest opacity-60">System Plan</h3>
                    <h2 className="text-3xl font-black tracking-tighter uppercase mt-2">{plan.name}</h2>
                 </div>
                 <BadgeCheck className="w-12 h-12 opacity-40 shrink-0" />
              </div>

              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                 <span className="text-sm font-black uppercase tracking-widest opacity-60">/ Month</span>
              </div>

              <div className="pt-8 border-t border-white/10 space-y-4">
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Subscription materialized (Active)
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60">
                    <Clock className="w-5 h-5" /> Next Cycle: {plan.expiry}
                 </div>
              </div>
           </div>
        </div>

        {/* Resource Consumption */}
        <div className="lg:col-span-2 p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group">
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
              <Zap className="w-7 h-7 text-amber-500" /> Resource Consumption
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {plan.limits.map((limit) => (
                <div key={limit.name} className="space-y-4">
                   <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{limit.name}</span>
                      <span className="text-sm font-black text-white tracking-widest">{limit.used}{limit.unit} <span className="opacity-40">/ {limit.total}{limit.unit}</span></span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <div 
                         className={cn("h-full rounded-full transition-all duration-1000", limit.color)} 
                         style={{ width: `${(limit.used / limit.total) * 100}%` }}
                      />
                   </div>
                </div>
              ))}
              <div className="flex items-center gap-6 p-6 rounded-[32px] bg-white/[0.02] border border-white/5 mt-4">
                 <AlertCircle className="w-10 h-10 text-amber-500 opacity-40 shrink-0" />
                 <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">System resources reset every 30 days based on the original subscription timestamp.</p>
              </div>
           </div>
        </div>

        {/* Fiscal History */}
        <div className="lg:col-span-3 p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl overflow-hidden">
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
              <History className="w-7 h-7 text-gray-500" /> Fiscal Artifact Log (Invoices)
           </h2>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-white/5">
                       <th className="pb-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">Artifact Identity</th>
                       <th className="pb-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">Temporal Node</th>
                       <th className="pb-6 text-[10px] font-black text-gray-600 uppercase tracking-widest text-right">Revenue Vector</th>
                       <th className="pb-6 text-[10px] font-black text-gray-600 uppercase tracking-widest text-right">Execution</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 font-black text-white uppercase tracking-tighter shadow-inner">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="group hover:bg-white/[0.01] transition-colors">
                         <td className="py-6 text-sm flex items-center gap-4 group-hover:text-indigo-400 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-600 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                               <Package className="w-4 h-4" />
                            </div>
                            {inv.id}
                         </td>
                         <td className="py-6 text-xs text-gray-500">{new Date(inv.date).toLocaleDateString()}</td>
                         <td className="py-6 text-sm text-right tracking-widest">${inv.amount}.00</td>
                         <td className="py-6 text-right">
                            <button title="download" className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                               <Download className="w-4 h-4" />
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
}
