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
  Gavel, CheckCircle as Verified, ShieldX,
  FileSearch, MessageSquare, Code2, 
  CloudLightning, Lock, Unlock, Rocket
} from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
  id: string;
  name: string;
  version: string;
  developer: string;
  category: string;
  submittedAt: string;
  status: 'PENDING_REVIEW' | 'UNDER_CORE_AUDIT' | 'REJECTED';
  riskLevel: 'LOW' | 'MEDIUM' | 'CRITICAL';
}

export default function MarketplaceReviewQueuePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([
     { id: '1', name: 'Identity Lattice Sync', version: '2.4.0', developer: 'Quasar Labs', category: 'Security', submittedAt: new Date().toISOString(), status: 'PENDING_REVIEW', riskLevel: 'LOW' },
     { id: '2', name: 'CRM Forensic Toolkit', version: '1.0.2', developer: 'DeepMind Ext', category: 'Analytics', submittedAt: new Date(Date.now() - 86400000).toISOString(), status: 'UNDER_CORE_AUDIT', riskLevel: 'MEDIUM' },
     { id: '3', name: 'Global Outreach Node', version: '0.9.8', developer: 'Unknown Actor', category: 'Communication', submittedAt: new Date(Date.now() - 172800000).toISOString(), status: 'PENDING_REVIEW', riskLevel: 'CRITICAL' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAction = (id: string, action: string) => {
     toast.success(`Extension artifact ${id} marked for ${action} dispatch`);
  };

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
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                 Ecosystem Guard Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Verification-Orchestrator</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Marketplace review queue</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Structural Audits, developer Identity-Attribution & ecosystem Integrity dispatches</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Initialize Core Audit
           </button>
        </div>
      </div>

      {/* Review Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Pending Certification', value: submissions.length, icon: Gavel, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Integrity Failure Rate', value: '1.2%', icon: ShieldX, color: 'text-red-500', bg: 'bg-red-500/10' },
           { label: 'Avg Audit Velocity', value: '4.2h', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Trust Lattice index', value: '98.8', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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

      {/* review Feed */}
      <div className="space-y-6">
         {submissions.map((sub) => (
           <div key={sub.id} className="p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] hover:border-indigo-500/20 transition-all group flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-indigo-500/5 transition-colors" />
              
              <div className="w-20 h-20 rounded-[32px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0 shadow-2xl">
                 <Package className="w-10 h-10" />
              </div>

              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-4 mb-3 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${sub.status === 'UNDER_CORE_AUDIT' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                       {sub.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${sub.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                       RISK: {sub.riskLevel}
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate">{sub.name}</h3>
                 </div>
                 <div className="flex items-center gap-6 text-[11px] text-gray-600 font-black uppercase tracking-widest leading-none">
                    <span className="flex items-center gap-2"><User className="w-4 h-4 opacity-40 shrink-0" /> {sub.developer}</span>
                    <span className="opacity-20 hidden md:block">•</span>
                    <span className="flex items-center gap-2 hidden md:flex"><Layers className="w-4 h-4 opacity-40 shrink-0" /> {sub.category} artifact</span>
                    <span className="opacity-20 hidden md:block">•</span>
                    <span className="flex items-center gap-2"><History className="w-4 h-4 opacity-40 shrink-0" /> v{sub.version}</span>
                 </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 relative">
                 <div className="hidden lg:block text-right pr-6 border-r border-white/5">
                    <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1.5 opacity-60">Submitted</p>
                    <p className="text-sm font-black text-white uppercase tracking-tighter">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                 </div>
                 <div className="flex gap-4">
                    <button 
                       onClick={() => handleAction(sub.id, 'CERTIFICATION')}
                       className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                    >
                       <Verified className="w-6 h-6" />
                    </button>
                    <button 
                       onClick={() => handleAction(sub.id, 'DIVERGENCE')}
                       className="p-5 rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    >
                       <ShieldX className="w-6 h-6" />
                    </button>
                    <button className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 text-gray-600 hover:text-white transition-all shadow-xl">
                       <FileSearch className="w-6 h-6" />
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Certification Intelligence Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[38px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0">
               <Code2 className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Code Forensics</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Analyze structural extension dispatches for vulnerabilities. Every certificated artifact must pass platform integrity verification.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[38px] bg-orange-500/10 text-orange-500 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all relative shrink-0">
               <CloudLightning className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Stress Lattices</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Execute pressure audit dispatches on extension artifacts. Verify performance persistence across theoretical global resource clusters.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
