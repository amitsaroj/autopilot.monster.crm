"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  BookOpen, FileText, Edit3, MoreVertical,
  Eye, Clock, Tag, Globe2, Sparkles,
  CheckCircle, PlusCircle, Bookmark, Share2,
  Trash, Save
} from 'lucide-react';
import { toast } from 'sonner';

interface Article {
  id: string;
  title: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  views: number;
  createdAt: string;
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/support/articles');
      const json = await res.json();
      if (json.data) setArticles(json.data);
    } catch (e) {
      toast.error('Failed to synchronize knowledge artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: any = {
      PUBLISHED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      DRAFT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      ARCHIVED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${colors[status]}`}>
        {status} Artifact
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
                 Knowledge Lattice Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: KB-Orchestrator</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Help-Center Artifacts</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Self-Service Documentation, FAQs & Searchable Wisdom</p>
        </div>
        <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
           <Plus className="w-4 h-4" /> Provision Knowledge Node
        </button>
      </div>

      {/* Control Module */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
            <input 
               type="text" 
               placeholder="Search article title, category, or content artifact..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
         <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Topology</span>
            <select className="bg-transparent border-none outline-none text-xs text-indigo-400 font-bold uppercase tracking-widest">
               <option>All Dispatches</option>
               <option>User Guides</option>
               <option>API Nodes</option>
               <option>Billing Wiki</option>
            </select>
         </div>
         <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between group cursor-pointer hover:bg-indigo-500/10 transition-all">
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest leading-none text-center">Sync Wiki</span>
            <RefreshCw onClick={fetchArticles} className="w-4 h-4 text-indigo-400 opacity-60 group-hover:rotate-180 transition-all duration-500" />
         </div>
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {articles.map((art) => (
           <div key={art.id} className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all group flex flex-col justify-between relative overflow-hidden h-[450px]">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors" />
              
              <div>
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                       <FileText className="w-8 h-8 shrink-0" />
                    </div>
                    <div className="flex gap-2 text-gray-700">
                       <button className="p-2 hover:text-white transition-all"><Eye className="w-4 h-4" /></button>
                       <button className="p-2 hover:text-white transition-all"><Share2 className="w-4 h-4" /></button>
                    </div>
                 </div>

                 {getStatusBadge(art.status)}

                 <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight mt-6 mb-4 line-clamp-3 leading-tight">{art.title || 'Untitled Knowledge Artifact'}</h3>
                 <div className="flex items-center gap-2 mb-8">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{art.category || 'General-Intel'}</span>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-gray-700 font-black uppercase tracking-widest">
                       <Activity className="w-4 h-4 opacity-40 shrink-0" /> {art.views?.toLocaleString() || 0} Forensics
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-700 font-black uppercase tracking-widest">
                       <Clock className="w-4 h-4 opacity-40 shrink-0" /> {new Date(art.createdAt).toLocaleDateString()}
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button className="flex-1 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                       <Edit3 className="w-4 h-4" /> Edit Artifact
                    </button>
                    <button className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-600 hover:text-red-400 transition-all">
                       <Trash className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </div>
         ))}

         {/* Blueprint Placeholder */}
         <div className="p-10 rounded-[40px] border border-dashed border-white/10 bg-indigo-500/[0.01] flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover:border-indigo-500/30 transition-all h-[450px]">
            <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
               <PlusCircle className="w-10 h-10" />
            </div>
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight font-sans">Draft New Documentation</h3>
               <p className="text-sm text-gray-500 max-w-[200px] mx-auto leading-relaxed mt-2 uppercase tracking-widest font-black opacity-30">Knowledge Persistence Status: Active Scanning</p>
            </div>
            <button className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:underline">
               Initialize Knowledge Dispatch <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Knowledge Strategy & Intelligence Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-6 rounded-[32px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0">
               <Sparkles className="w-12 h-12" />
            </div>
            <div className="space-y-3 relative">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">AI Content Forensics</h3>
               <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm">
                  Automatically generate help-center dispatches from your support ticket forensics. Utilize high-velocity intelligence to optimize KB persistence.
               </p>
            </div>
         </div>
         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
            <div className="p-6 rounded-[32px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all relative shrink-0">
               <Globe2 className="w-12 h-12" />
            </div>
            <div className="space-y-3 relative">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">Global SEO Lattices</h3>
               <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm">
                  Expose your workspace documentation to global search nodes. Orchestrate high-velocity organic growth via systemic help-center SEO optimizations.
               </p>
            </div>
         </div>
      </div>

      {/* Compliance & Persistence Policy */}
      <div className="p-12 rounded-[60px] bg-indigo-500 to-purple-800 text-white flex flex-col md:flex-row items-center justify-between gap-10 group shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
         <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
         <div className="flex items-center gap-10 relative">
            <div className="p-7 rounded-[32px] bg-white/20 backdrop-blur-md border border-white/20">
               <Bookmark className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
               <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Knowledge Policy Manifest</h3>
               <p className="text-sm text-white/70 font-bold uppercase tracking-tight max-w-xl">
                  Documentation artifacts follow the 'Public Dispersion' protocol. Administrative dispatches are cryptographically persistence-locked within the workspace node.
               </p>
            </div>
         </div>
         <button className="px-10 py-5 bg-white text-[#0b0f19] rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 shrink-0 relative">
            Policy Forensics
         </button>
      </div>

    </div>
  );
}
