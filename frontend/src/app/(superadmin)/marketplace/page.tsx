"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  author: string;
  active: boolean;
  installations: number;
  metadata: any;
  createdAt: string;
}

export default function GlobalMarketplacePage() {
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
      toast.error('Failed to sync platform marketplace artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

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
                 Marketplace active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Catalog: Global Plugins</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Plugin Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Curate & Manage Platform Functional Modules</p>
        </div>
        <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
           <Plus className="w-4 h-4" /> Provision Plugin
        </button>
      </div>

      {/* Control Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
            <input 
               type="text" 
               placeholder="Search by plugin identifier, category, or author artifact..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
         <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Category</span>
            <select className="bg-transparent border-none outline-none text-xs text-indigo-400 font-bold uppercase tracking-widest">
               <option>All Modules</option>
               <option>Automation</option>
               <option>Integrations</option>
               <option>Analytics</option>
            </select>
         </div>
         <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Active Installs</span>
            <span className="text-sm font-black text-white">4,281</span>
         </div>
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {plugins.map((plugin) => (
           <div key={plugin.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-indigo-500/5 transition-colors" />
              
              <div>
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                       <Package className="w-7 h-7" />
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-gray-600 hover:text-white transition-all">
                          <Settings className="w-4 h-4" />
                       </button>
                    </div>
                 </div>

                 <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2">
                       <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{plugin.name}</h3>
                       <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/5 text-[8px] font-black text-gray-500">v{plugin.version}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">ID: {plugin.id.substring(0, 16)}...</p>
                 </div>

                 <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-8">
                    {plugin.description || 'Advanced platform module provisioned with systemic permissions and cross-tenant execution capabilities.'}
                 </p>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                      <Users className="w-3.5 h-3.5 text-gray-600" />
                      <div>
                         <p className="text-[9px] text-gray-600 font-black uppercase tracking-tighter leading-tight">Installs</p>
                         <p className="text-xs font-black text-white">{plugin.installations || 142}</p>
                      </div>
                   </div>
                   <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                         <p className="text-[9px] text-gray-600 font-black uppercase tracking-tighter leading-tight">Rating</p>
                         <p className="text-xs font-black text-white">4.9/5</p>
                      </div>
                   </div>
                 </div>

                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-1">
                    <span className="text-gray-600">Category: {plugin.category || 'Automation'}</span>
                    <span className={`flex items-center gap-1.5 ${plugin.active ? 'text-emerald-500' : 'text-gray-500'}`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${plugin.active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-gray-500'} `} />
                       {plugin.active ? 'Artifact Public' : 'Draft Persistence'}
                    </span>
                 </div>

                 <button className="w-full py-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.1] text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2">
                    Review Deployment Manifest <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
         ))}

         {/* Blueprint Placeholder */}
         <div className="p-10 rounded-[40px] border border-dashed border-white/10 bg-indigo-500/[0.01] flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover:border-indigo-500/30 transition-all">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
               <Layers className="w-8 h-8" />
            </div>
            <div>
               <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-tight">Functional Blueprints</h3>
               <p className="text-xs text-gray-500 max-w-[200px] mx-auto leading-relaxed mt-2">
                  Initialize a new plugin from systemic archetypes or cross-cluster sync.
               </p>
            </div>
            <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:underline transition-all">
               Initialize Orchestrator <Plus className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Marketplace Infrastructure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-10 rounded-[40px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="flex items-center gap-6 mb-6">
               <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <Globe className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter font-sans">Global Distribution</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Master-Node Synchronized</p>
               </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm font-medium">
               Orchestrate plugin availability across regional clusters, manage global versioning artifacts and verify cross-platform security seals.
            </p>
         </div>
         <div className="p-10 rounded-[40px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex items-center gap-6 mb-6">
               <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter font-sans">Artifact Security</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Zero-Trust Verified</p>
               </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm font-medium">
               All marketplace artifacts undergo systemic sandbox verification and static code analysis before admission to the global catalog.
            </p>
         </div>
      </div>

    </div>
  );
}
