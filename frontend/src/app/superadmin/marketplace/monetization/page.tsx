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
  DollarSign, CreditCard, Banknote, Landmark,
  TrendingUp, BarChart3, PieChart, Target,
  Wallet, Receipt, ArrowUpRight, CloudLightning
} from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  pluginName: string;
  amount: number;
  revenueShare: number;
  developer: string;
  status: 'SETTLED' | 'PENDING' | 'DISPUTED';
  createdAt: string;
}

export default function MarketplaceMonetizationPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
     { id: 'TX-9901', pluginName: 'Identity Lattice Sync', amount: 49.00, revenueShare: 14.70, developer: 'Quasar Labs', status: 'SETTLED', createdAt: new Date().toISOString() },
     { id: 'TX-9902', pluginName: 'CRM Forensic Toolkit', amount: 129.00, revenueShare: 38.70, developer: 'DeepMind Ext', status: 'PENDING', createdAt: new Date(Date.now() - 3600000).toISOString() },
     { id: 'TX-9903', pluginName: 'Global Outreach Node', amount: 19.99, revenueShare: 6.00, developer: 'Unknown Actor', status: 'SETTLED', createdAt: new Date(Date.now() - 172800000).toISOString() },
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
                 Financial Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Monetization-Orchestrator</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Marketplace Monetization</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Revenue Lattices, transaction Forensics & developer Payout dispatches</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group">
              <Landmark className="w-4 h-4 text-emerald-500" /> Initialize Payout Node
           </button>
        </div>
      </div>

      {/* Monetization Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Gross Marketplace Volume', value: '$12,482', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Platform Revenue Share', value: '$3,744', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Pending Payouts', value: '$1,290', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Monetization Efficiency', value: '99.2%', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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

      {/* Transaction Feed */}
      <div className="p-12 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group shadow-inner">
         <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
         <div className="flex justify-between items-start mb-10">
            <div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">Financial Forensics</h3>
               <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2 px-1">Audit: Structural Transactions</p>
            </div>
            <button className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-all shadow-lg">
               <RefreshCw className="w-6 h-6" />
            </button>
         </div>

         <div className="space-y-4 relative max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-8 rounded-[45px] bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/20 transition-all group flex flex-col md:flex-row items-center gap-10">
                 <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-2xl shrink-0">
                    <Receipt className="w-8 h-8" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                       <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-gray-500 uppercase tracking-widest">{tx.id}</span>
                       <h4 className="text-xl font-black text-white uppercase tracking-tight truncate">{tx.pluginName}</h4>
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${tx.status === 'SETTLED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{tx.status}</span>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] text-gray-600 font-black uppercase tracking-widest">
                       <span className="flex items-center gap-2"><User className="w-3.5 h-3.5 opacity-40 shrink-0" /> {tx.developer}</span>
                       <span className="opacity-20">•</span>
                       <span className="flex items-center gap-2 px-1"><Clock className="w-3.5 h-3.5 opacity-40 shrink-0" /> {new Date(tx.createdAt).toLocaleTimeString()}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-12 shrink-0">
                    <div className="text-right">
                       <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1.5 opacity-60 leading-none">Gross Dispatch</p>
                       <p className="text-2xl font-black text-white uppercase tracking-tighter">${tx.amount.toFixed(2)}</p>
                    </div>
                    <div className="text-right pr-6 border-r border-white/5">
                       <p className="text-[10px] text-emerald-500/40 font-black uppercase tracking-widest mb-1.5 leading-none">Platform Share</p>
                       <p className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">${tx.revenueShare.toFixed(2)}</p>
                    </div>
                    <button className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-700 hover:text-white transition-all shadow-xl">
                       <ArrowRight className="w-6 h-6" />
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Monetization Persistence Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col justify-between relative overflow-hidden shadow-2xl h-[420px]">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
            <div className="space-y-6 relative">
               <div className="flex items-center gap-6">
                  <div className="p-6 rounded-[32px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-2xl">
                     <BarChart3 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter text-sans leading-none">Yield Discovery</h3>
               </div>
               <p className="text-lg text-gray-500 font-medium leading-relaxed uppercase tracking-tight opacity-80 pt-4">
                  Analyze structural yield dispatches across all extension artifacts. Identify high-velocity monetization nodes globally.
               </p>
            </div>
            <button className="w-full py-6 bg-white/[0.02] border border-white/10 rounded-3xl text-[10px] font-black uppercase text-white tracking-widest hover:bg-white/5 transition-all">
               Initialize yield Analysis
            </button>
         </div>
         <div className="p-10 rounded-[60px] bg-white/[0.01] border border-white/5 flex flex-col justify-between relative overflow-hidden shadow-2xl h-[420px]">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px]" />
            <div className="space-y-6 relative">
               <div className="flex items-center gap-6">
                  <div className="p-6 rounded-[32px] bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-2xl">
                     <CreditCard className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter text-sans leading-none">Payout Forensics</h3>
               </div>
               <p className="text-lg text-gray-500 font-medium leading-relaxed uppercase tracking-tight opacity-80 pt-4">
                  Orchestrate global developer payout cycles. Track systemic fund persistence and transfer forensics across theoretical financial clusters.
               </p>
            </div>
            <button className="w-full py-6 bg-emerald-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20">
               Initialize Global Payout Dispatch
            </button>
         </div>
      </div>

    </div>
  );
}
