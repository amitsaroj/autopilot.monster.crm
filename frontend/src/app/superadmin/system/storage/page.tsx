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
  HardDrive, Cloud, Save,
  FolderOpen, FileType, Share2, Target,
  Lock, Unlock, Archive, Box, Files
} from 'lucide-react';
import { toast } from 'sonner';

interface StorageNode {
  id: string;
  name: string;
  provider: 'AWS_S3' | 'LOCAL_SSD' | 'GOOGLE_CLOUD' | 'AZURE_BLOB';
  region: string;
  count: string;
  size: string;
  status: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
}

export default function GlobalStoragePersistencePage() {
  const [nodes, setNodes] = useState<StorageNode[]>([
     { id: '1', name: 'Primary Artifact Cluster', provider: 'AWS_S3', region: 'us-east-1', count: '142.0k', size: '1.2 TB', status: 'ONLINE' },
     { id: '2', name: 'Identity Forensics Archive', provider: 'LOCAL_SSD', region: 'node-a-internal', count: '8.4m', size: '840 GB', status: 'ONLINE' },
     { id: '3', name: 'Voice Synthesis Cache', provider: 'GOOGLE_CLOUD', region: 'europe-west1', count: '422', size: '4.2 GB', status: 'ONLINE' },
     { id: '4', name: 'Legacy Log Ledger', provider: 'AWS_S3', region: 'us-west-2', count: '0', size: '0 B', status: 'MAINTENANCE' },
  ]);
  const [loading, setLoading] = useState(false);

  if (loading) {
     return (
        <div className="flex h-[70vh] items-center justify-center">
           <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
     );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                 Persistence Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Storage-Persistence-Orchestrator</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Storage Persistence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Structural data dispatches, bucket forensics & systemic artifact persistence</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group">
              <Plus className="w-4 h-4" /> Provision Storage Node
           </button>
        </div>
      </div>

      {/* Persistence Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Platform Artifacts', value: nodes.reduce((acc, n) => acc + (n.count.includes('k') ? parseFloat(n.count)*1000 : parseFloat(n.count)), 0).toLocaleString(), icon: Files, color: 'text-blue-500', bg: 'bg-blue-500/10' },
           { label: 'Structural Volume', value: '2.04 TB', icon: HardDrive, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Persistence Lattice', value: 'OPTIMAL', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Integrity Check', value: 'Verified', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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

      {/* Storage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {nodes.map((node) => (
           <div key={node.id} className="p-12 rounded-[60px] bg-white/[0.01] border border-white/[0.05] hover:border-blue-500/20 transition-all group flex flex-col justify-between h-[480px] relative overflow-hidden shadow-inner">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/[0.01] rounded-full blur-[100px] group-hover:bg-blue-500/5 transition-colors shadow-2xl" />
              
              <div>
                 <div className="flex justify-between items-start mb-10">
                    <div className="w-20 h-20 rounded-[35px] bg-white/[0.03] border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-2xl">
                       <Cloud className="w-10 h-10" />
                    </div>
                    <div className="flex gap-4">
                       <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${node.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                          {node.status}
                       </span>
                       <button className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 text-gray-600 hover:text-white transition-all">
                          <Settings className="w-6 h-6" />
                       </button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none group-hover:text-blue-400 transition-colors">{node.name}</h3>
                    <p className="text-[12px] text-gray-600 font-mono italic uppercase tracking-tighter flex items-center gap-2">
                       <Globe className="w-4 h-4 opacity-40 shrink-0" /> {node.provider} Node • {node.region} 
                    </p>
                 </div>
              </div>

              <div className="space-y-10 pt-10 border-t border-white/5 relative">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-2">
                       <p className="text-[11px] text-gray-700 font-black uppercase tracking-widest mb-1.5 opacity-60">Artifact count</p>
                       <p className="text-2xl font-black text-white uppercase tracking-tighter italic">{node.count}</p>
                    </div>
                    <div className="space-y-2 text-right">
                       <p className="text-[11px] text-gray-700 font-black uppercase tracking-widest mb-1.5 opacity-60">Occupancy dispatch</p>
                       <p className="text-2xl font-black text-blue-400 uppercase tracking-tighter italic">{node.size}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="flex-1 py-6 rounded-[32px] bg-white text-[#0b0f19] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/10">
                       Open structural bucket
                    </button>
                    <button className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 text-gray-700 hover:text-blue-400 transition-all shadow-xl">
                       <Share2 className="w-7 h-7" />
                    </button>
                 </div>
              </div>
           </div>
         ))}

         {/* Blueprint Placeholder for New Nodes */}
         <div className="p-12 rounded-[60px] border border-dashed border-white/10 bg-blue-500/[0.01] flex flex-col items-center justify-center text-center space-y-10 group cursor-pointer hover:border-blue-500/30 transition-all h-[480px]">
            <div className="w-28 h-28 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all shadow-inner">
               <Archive className="w-14 h-14" />
            </div>
            <div>
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight font-sans">Initialize Partition</h3>
               <p className="text-sm text-gray-600 max-w-[280px] mx-auto leading-relaxed mt-4 uppercase tracking-widest font-black opacity-30 italic leading-none">Persistence Slot: Available</p>
            </div>
            <button className="text-[11px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-3 hover:underline">
               Deploy Storage Dispatch <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* persistence Strategy Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[45px] bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl shadow-blue-500/20">
               <Database className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Data Forensics</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80 pt-2">
                  Analyze structural data dispatches. Monitor artifact persistence and systemic throughput across global storage nodes in real-time.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[45px] bg-red-500/10 text-red-500 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl shadow-red-500/20">
               <ShieldCheck className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Integrity Pulse</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80 pt-2">
                  Maintain global data persistence. Synchronize structural integrity artifacts across theoretical geographical storage clusters.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
