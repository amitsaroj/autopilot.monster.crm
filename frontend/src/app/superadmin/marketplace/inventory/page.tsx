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
  Puzzle, Code, Smartphone, Monitor,
  Cpu as Processor, Blocks, Box, 
  Share2, ArrowUpRight, BarChart3,
  ShieldAlert, ShieldPlus, MoreVertical, Edit2
} from 'lucide-react';
import { toast } from 'sonner';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  status: 'PUBLISHED' | 'DRAFT' | 'VERIFICATION_PENDING';
  installCount: number;
  category: string;
  icon?: string;
  createdAt: string;
}

export default function MarketplaceInventoryPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/marketplace/plugins');
      const json = await res.json();
      if (json.data) setPlugins(json.data);
    } catch (e) {
      toast.error('Failed to synchronize marketplace inventory dispatches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const getStatusBadge = (status: string) => {
    const caps: any = {
      PUBLISHED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      DRAFT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      VERIFICATION_PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${caps[status]}`}>
        {status.replace('_', ' ')}
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Marketplace Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Extension-Orchestrator</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Marketplace Inventory</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Global Extension artifacts, Installation Forensics & Developer Persistence</p>
        </div>
        <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group">
           <Plus className="w-4 h-4" /> Provision Extension Node
        </button>
      </div>

      {/* Inventory Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Global Extensions', value: plugins.length, icon: Blocks, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Platform Installs', value: plugins.reduce((acc, p) => acc + (p.installCount || 0), 0), icon: Download, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Developer Lattices', value: '12 Active', icon: Code, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Platform Integrity', value: 'Verified', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
         ].map((stat) => (
           <div key={stat.label} className="p-6 rounded-[32px] bg-white/[0.01] border border-white/[0.05] flex items-center gap-6 group hover:bg-white/[0.02] transition-all relative overflow-hidden">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-2xl`}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-0.5 leading-none">{stat.label}</p>
                 <p className="text-xl font-black text-white uppercase tracking-tighter">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Control Module */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="w-full md:max-w-md p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all shadow-inner">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
            <input 
               type="text" 
               placeholder="Search extension moniker, developer node, or category lattice..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
         <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between min-w-[180px]">
               <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Category</span>
               <select className="bg-transparent border-none outline-none text-[10px] text-indigo-400 font-black uppercase px-2">
                  <option>All Lattices</option>
                  <option>Automation</option>
                  <option>Communication</option>
                  <option>Forensics</option>
               </select>
            </div>
            <button onClick={fetchPlugins} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all shadow-lg">
               <RefreshCw className="w-5 h-5" />
            </button>
         </div>
      </div>

      {/* Extension Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {plugins.map((plugin) => (
           <div key={plugin.id} className="p-8 rounded-[40px] bg-white/[0.01] border border-white/[0.05] hover:border-indigo-500/20 transition-all group relative overflow-hidden flex flex-col justify-between h-[450px]">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors" />
              
              <div>
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-2xl">
                       <Puzzle className="w-10 h-10" />
                    </div>
                    <div className="flex items-center gap-3">
                       {getStatusBadge(plugin.status)}
                       <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-gray-600 hover:text-white transition-all">
                          <MoreVertical className="w-5 h-5" />
                       </button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight mb-2 leading-none">{plugin.name || 'Untitled Extension'}</h3>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2 uppercase tracking-wide opacity-80">{plugin.description || 'No structural description provided for this extension artifact.'}</p>
                    
                    <div className="flex items-center gap-4 pt-2">
                       <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          <User className="w-3 h-3 opacity-40 shrink-0" /> {plugin.author || 'Internal Node'}
                       </div>
                       <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          <History className="w-3 h-3 opacity-40 shrink-0" /> v{plugin.version}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-[10px] text-gray-700 font-black uppercase tracking-widest shrink-0">
                       <Download className="w-4 h-4 opacity-40 shrink-0" /> {plugin.installCount || 0} Installs
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-700 font-black uppercase tracking-widest shrink-0">
                       <Star className="w-4 h-4 text-amber-500/40 shrink-0" /> 4.8 Rating
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="flex-1 py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 group/btn">
                       <Edit2 className="w-4 h-4 text-indigo-400 group-hover/btn:scale-110 transition-transform" /> Manage Node
                    </button>
                    <button className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-600 hover:text-white transition-all">
                       <Eye className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>
         ))}

         {/* Blueprint Placeholder for New Extensions */}
         <div className="p-10 rounded-[60px] border border-dashed border-white/10 bg-indigo-500/[0.01] flex flex-col items-center justify-center text-center space-y-8 group cursor-pointer hover:border-indigo-500/30 transition-all h-[450px]">
            <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
               <Puzzle className="w-12 h-12" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight font-sans">Initialize Extension</h3>
               <p className="text-sm text-gray-600 max-w-[240px] mx-auto leading-relaxed mt-3 uppercase tracking-widest font-black opacity-30">Plugin Slot: Available</p>
            </div>
            <button className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:underline">
               Deploy Extension Dispatch <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Global Intelligence Ribbon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[32px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0">
               <ShieldCheck className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Security Verification</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Automated structural security dispatches verify every extension artifact. Ensure absolute integrity across your platform extension lattice.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[32px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all relative shrink-0">
               <BarChart3 className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Marketplace Pulse</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Analyze installation velocity and revenue persistence for every extension artifact. Orchestrate high-fidelity marketplace growth dispatches.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
