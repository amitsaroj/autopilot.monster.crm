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
  Grid, List as ListIcon, Tags, Bookmark,
  Sparkles, Megaphone, Target, Briefcase,
  Compass, Map, MoveRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  count: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

interface Collection {
  id: string;
  name: string;
  pluginCount: number;
  featured: boolean;
}

export default function MarketplaceCatalogManagementPage() {
  const [categories, setCategories] = useState<Category[]>([
     { id: '1', name: 'Automation Lattices', count: 24, status: 'ACTIVE' },
     { id: '2', name: 'Structural Security', count: 12, status: 'ACTIVE' },
     { id: '3', name: 'Identity Forensics', count: 8, status: 'ACTIVE' },
     { id: '4', name: 'CRM Connectors', count: 42, status: 'ACTIVE' },
  ]);

  const [collections, setCollections] = useState<Collection[]>([
     { id: '1', name: 'Launch Essentials', pluginCount: 6, featured: true },
     { id: '2', name: 'Enterprise Hardening', pluginCount: 4, featured: true },
     { id: '3', name: 'High-Velocity Growth', pluginCount: 8, featured: false },
  ]);

  const [loading, setLoading] = useState(false);

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
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Taxonomy Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Catalog-Orchestrator</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Marketplace Catalog</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Taxonomy Artifacts, Featured extension dispatches & structural persistence</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group">
              <Plus className="w-4 h-4" /> Provision Category Node
           </button>
        </div>
      </div>

      {/* Catalog Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Platform Categories', value: categories.length, icon: Tags, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Active Collections', value: collections.length, icon: Bookmark, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Extensions Tracked', value: categories.reduce((acc, c) => acc + c.count, 0), icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Discovery Velocity', value: 'High', icon: Compass, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Categories Ledger */}
         <div className="lg:col-span-2 p-12 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group shadow-inner">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">Taxonomy Lattices</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2 px-1">Forensics: Structural Categories</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
               {categories.map((cat) => (
                  <div key={cat.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all group/item flex flex-col justify-between h-[220px]">
                     <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover/item:bg-indigo-500 group-hover/item:text-white flex items-center justify-center transition-all shadow-xl">
                           <Layout className="w-6 h-6" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-gray-700 uppercase tracking-widest group-hover/item:text-white/40 transition-colors">{cat.status}</span>
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tight group-hover/item:text-indigo-400 transition-colors truncate">{cat.name}</h4>
                        <div className="flex items-center justify-between mt-4">
                           <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-none shrink-0">{cat.count} Artifacts Tracked</p>
                           <button className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-gray-700 hover:text-white transition-all">
                              <Settings className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Collections Grid */}
         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col justify-between relative overflow-hidden shadow-2xl h-full">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />
            <div className="space-y-10 relative">
               <div className="flex items-center gap-6">
                  <div className="p-5 rounded-3xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-2xl">
                     <Bookmark className="w-10 h-10" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Collections</h3>
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Audit: Curation Artifacts</p>
                  </div>
               </div>

               <div className="space-y-6">
                  {collections.map((col) => (
                    <div key={col.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/row flex flex-col justify-between h-[180px]">
                       <div className="flex justify-between items-start">
                          <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none group-hover/row:text-purple-400 transition-colors">{col.name}</h4>
                          {col.featured && <Sparkles className="w-5 h-5 text-amber-500" />}
                       </div>
                       <div className="flex justify-between items-center text-[10px] text-gray-600 font-black uppercase tracking-widest italic">
                          <span>{col.pluginCount} Nodes</span>
                          <button className="flex items-center gap-2 text-indigo-400 hover:underline">Manage Dispatch <MoveRight className="w-3.5 h-3.5" /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-10 rounded-[45px] bg-indigo-500 text-white space-y-4 shadow-2xl shadow-indigo-500/20 relative overflow-hidden cursor-pointer group/promo mt-10">
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover/promo:scale-125 transition-transform" />
               <div className="flex items-center gap-6 mb-2">
                  <Megaphone className="w-10 h-10" />
                  <h4 className="text-2xl font-black uppercase tracking-tighter leading-none text-sans">Promotion Lattices</h4>
               </div>
               <p className="text-xs text-white/80 leading-relaxed font-bold uppercase tracking-tight">
                  Orchestrate global marketplace discovery dispatches. Deploy featured extension artifacts across all platform discovery nodes.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
