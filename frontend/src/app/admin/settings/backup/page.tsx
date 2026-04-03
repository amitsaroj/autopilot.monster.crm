"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  Database, HardDrive, Cloud, FileJson, 
  FileSpreadsheet, Clock, Save, History,
  Shield, Rocket, ArrowUpCircle, Container
} from 'lucide-react';
import { toast } from 'sonner';

export default function WorkspaceDataManagementPage() {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState([
     { id: '1', name: 'Structural Sync Artifact', size: '4.2 MB', type: 'FULL_JSON', createdAt: new Date().toISOString() },
     { id: '2', name: 'CRM LATTICE_EXPORT', size: '1.8 MB', type: 'CSV_EXPORT', createdAt: new Date(Date.now() - 86400000).toISOString() },
  ]);

  const handleExport = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/crm/export/${type}`);
      const json = await res.json();
      if (json.data) {
         const blob = new Blob([json.data], { type: 'text/csv' });
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `autopilot_monster_export_${type}_${Date.now()}.csv`;
         a.click();
         toast.success('Data artifact exported successfully');
      }
    } catch (e) {
      toast.error('Failed to initialize export dispatch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Persistence Protocol Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Data-Resilience-Hub</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Data Integrity forensics</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Backups, Data Portability & Persistence Lattices</p>
        </div>
        <button 
           className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group hover:scale-105 active:scale-95"
        >
           <Save className="w-4 h-4" /> Provision Snapshot Node
        </button>
      </div>

      {/* Resilience Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Integrity Pulse', value: '100%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Storage Persistence', value: '4.2 GB', icon: HardDrive, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Recovery Latency', value: '1.2s', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Cloud Synchronicity', value: 'Active', icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-500/10' },
         ].map((stat) => (
           <div key={stat.label} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.03] transition-all relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors" />
              <div className="flex justify-between items-start mb-6">
                 <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-8 h-8" />
                 </div>
              </div>
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-1 opacity-60 leading-none">{stat.label}</p>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{stat.value}</h3>
           </div>
         ))}
      </div>

      {/* Data Export Orchestration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">Export Dispatches</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2 px-1">Orchestrate Data Portability Artifacts</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
               {[
                 { label: 'CRM Contacts Lattice', icon: Users, type: 'contact' },
                 { label: 'Growth Leads Funnel', icon: Zap, type: 'lead' },
                 { label: 'Fiscal Deal History', icon: Package, type: 'deal' },
                 { label: 'Communication History', icon: Activity, type: 'activity' },
               ].map((exp) => (
                  <div key={exp.label} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 transition-all group/card cursor-pointer">
                     <div className="flex justify-between items-start mb-8">
                        <div className="p-4 rounded-2xl bg-white/[0.03] text-gray-500 group-hover/card:bg-indigo-500 group-hover/card:text-white transition-all shadow-xl">
                           <exp.icon className="w-8 h-8" />
                        </div>
                        <Download 
                           onClick={() => handleExport(exp.type)} 
                           className="w-5 h-5 text-gray-700 hover:text-white transition-all" 
                        />
                     </div>
                     <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-2">{exp.label}</h4>
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest italic animate-pulse group-hover/card:animate-none">Artifact: Multi-Node CSV</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] space-y-10 group relative overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="space-y-6">
               <div className="flex items-center gap-6">
                  <div className="p-5 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                     <History className="w-10 h-10" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Persistence snapshots</h3>
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Audit: 2 Active Nodes</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {backups.map((b) => (
                    <div key={b.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 group/row hover:bg-white/[0.05] transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <p className="text-sm font-black text-white uppercase tracking-tight">{b.name}</p>
                          <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">v1.{b.id}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] text-gray-600 font-mono italic">
                          <span>{b.size}</span>
                          <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-indigo-500 to-purple-800 text-white space-y-4 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
               <div className="flex items-center gap-4">
                  <Cloud className="w-8 h-8" />
                  <h4 className="text-lg font-black uppercase tracking-tighter leading-none">Recovery Lattice</h4>
               </div>
               <p className="text-xs text-white/80 leading-relaxed font-bold uppercase tracking-tight">
                  Automated cloud synchronization dispatches ensure 99.9% persistence resilience across global database nodes.
               </p>
               <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">
                  Initialize Recovery
               </button>
            </div>
         </div>
      </div>

      {/* Persistence Policy Ledger */}
      <div className="p-12 rounded-[60px] bg-white/[0.01] border border-dashed border-white/10 flex flex-col md:flex-row items-center justify-between gap-10 group mt-10">
          <div className="flex items-center gap-10">
             <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-indigo-500 group-hover:text-white transition-all opacity-40 group-hover:opacity-100">
                <Database className="w-12 h-12" />
             </div>
             <div>
                <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">Persistence Policy Manifest</h4>
                <p className="text-sm text-gray-600 max-w-xl font-medium tracking-tight uppercase px-1">Workspace artifacts follow the 'Cryptographic Persistence' protocol. Backups are delta-synchronized every phase-cycle with absolute integrity-verification.</p>
             </div>
          </div>
          <button className="px-10 py-5 bg-white text-[#0b0f19] rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 shrink-0">
             Compliance Audit
          </button>
      </div>

    </div>
  );
}
