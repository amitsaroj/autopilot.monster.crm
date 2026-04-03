"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  Mail, Send, MousePointer2, Eye,
  BarChart3, Clock, Edit2, MoreVertical,
  CheckCircle, Target, Rocket, PieChart,
  FileText, LayoutTemplate, Sparkles, Inbox
} from 'lucide-react';
import { toast } from 'sonner';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
  scheduledAt?: string;
  createdAt: string;
}

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/crm/campaigns?type=EMAIL');
      const json = await res.json();
      if (json.data) setCampaigns(json.data);
    } catch (e) {
      toast.error('Failed to synchronize email outreach artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: any = {
      SENT: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      DRAFT: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      SENDING: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      FAILED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${colors[status] || 'bg-white/5 text-gray-400 border-white/10'}`}>
        {status} Dispatch
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Email Lattice Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: SMTP-Orchestrator</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Email Outreach Artifacts</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Newsletters, Cold Dispatches & Template Persistence</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <LayoutTemplate className="w-5 h-5" />
           </button>
           <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Provision Email Dispatch
           </button>
        </div>
      </div>

      {/* Analytics Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Dispatch Total', value: '428K', icon: Send, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Mean Open Rate', value: '31.2%', icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Mean Click Rate', value: '8.4%', icon: MousePointer2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Bounce Forensics', value: '0.8%', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
         ].map((stat) => (
           <div key={stat.label} className="p-6 rounded-[32px] bg-white/[0.01] border border-white/[0.05] flex items-center gap-6 group hover:bg-white/[0.02] transition-all">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-0.5">{stat.label}</p>
                 <p className="text-xl font-black text-white uppercase tracking-tighter">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Email Campaign Ledger */}
      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.01] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Dispatch Identity</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Sent Latency</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Engagement Forensics</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Systemic Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Inspect</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.05]">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Mail className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{camp.name}</p>
                                <p className="text-[10px] text-gray-600 font-mono mt-0.5 uppercase tracking-tighter flex items-center gap-1.5 truncate max-w-[200px]">
                                   Sub: {camp.subject}
                                </p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="space-y-1">
                             <p className="text-sm font-black text-white uppercase tracking-tighter">{camp.stats?.sent?.toLocaleString() || 0} Artifacts</p>
                             <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Timestamp: {new Date(camp.createdAt).toLocaleDateString()}</p>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-6">
                             <div>
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Open</p>
                                <p className="text-xs font-black text-emerald-500">{camp.stats?.opened || 0}%</p>
                             </div>
                             <div className="w-px h-6 bg-white/5" />
                             <div>
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">CTR</p>
                                <p className="text-xs font-black text-indigo-400">{camp.stats?.clicked || 0}%</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          {getStatusBadge(camp.status || 'DRAFT')}
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 text-gray-500">
                             <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:text-white hover:bg-white/10 transition-all">
                                <BarChart3 className="w-4 h-4" />
                             </button>
                             <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:text-indigo-400 transition-all">
                                <Edit2 className="w-4 h-4" />
                             </button>
                             <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:text-red-400 transition-all">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-8 py-24 text-center">
                         <div className="flex flex-col items-center gap-6 text-gray-700">
                            <Inbox className="w-16 h-16 opacity-10" />
                            <div className="space-y-1">
                               <p className="text-lg font-bold text-gray-500 font-sans uppercase tracking-widest">Lattice Synchronization Empty</p>
                               <p className="text-xs text-gray-600 font-medium">No email outreach artifacts detected in this workspace cluster. Initialize your first SMTP dispatch to begin tracking engagement vector.</p>
                            </div>
                            <button className="px-8 py-3 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20">
                               Initialize Email Dispatch
                            </button>
                         </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Template & Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="flex items-center gap-4">
               <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <LayoutTemplate className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter">Artifact Blueprints</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               Manage high-fidelity email templates. Orchestrate brand identity across all outreach dispatches with systemic template persistence.
            </p>
         </div>
         <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex items-center gap-4">
               <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Sparkles className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter">AI Content Core</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               Leverage AI intelligence to optimize subject line forensics and artifact content. Increase engagement pulse with systemic personalization artifacts.
            </p>
         </div>
         <div className="p-10 rounded-[40px] bg-indigo-500 to-purple-600 text-white space-y-4 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center gap-4 mb-2">
               <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
               </div>
               <div>
                  <h4 className="font-black text-sm uppercase tracking-widest leading-tight">SMTP Persistence</h4>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-tighter italic">Status: Delivered Certified</p>
               </div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-bold uppercase tracking-tight">
               Email artifacts are dispatched via a distributed SMTP lattice with 99.9% delivery persistence and real-time bounce-forensics synchronization.
            </p>
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">
               Analyze Delivery Lattices
            </button>
         </div>
      </div>

    </div>
  );
}
