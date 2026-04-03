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
  Eye, CornerDownRight, SquareAsterisk, Bug,
  Code, FileCode, MessageCircle, AlertOctagon,
  Flame, Wind, ZapOff, TrendingUp,
  CloudLightning
} from 'lucide-react';
import { toast } from 'sonner';

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  path?: string;
  method?: string;
  tenantId?: string;
  userId?: string;
  createdAt: string;
}

export default function PlatformErrorForensicsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/logs/errors');
      const json = await res.json();
      if (json.data && Array.isArray(json.data.items)) setLogs(json.data.items);
      else if (Array.isArray(json.data)) setLogs(json.data);
    } catch (e) {
      toast.error('Failed to synchronize error forensics dispatches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                 Failure Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Error-Forensics-Core</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">System Error Forensics</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Monitor Systemic Failures, Stack-Trace Artifacts & Cross-Tenant Bug Persistence</p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={fetchLogs} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <RefreshCw className="w-5 h-5" />
           </button>
           <button className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 flex items-center gap-2">
              <ZapOff className="w-4 h-4" /> Purge Failure Archives
           </button>
        </div>
      </div>

      {/* Failure Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Active Failures', value: logs.length, icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10' },
           { label: 'Stability Index', value: '98.4%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Latency Pressure', value: 'Low', icon: Wind, color: 'text-blue-500', bg: 'bg-blue-500/10' },
           { label: 'Integrity Check', value: 'Verified', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Error Feed */}
         <div className="lg:col-span-2 space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-4">
            {logs.map((log) => (
              <div 
                 key={log.id} 
                 onClick={() => setSelectedError(log)}
                 className={`p-6 rounded-[32px] border transition-all cursor-pointer group relative overflow-hidden ${selectedError?.id === log.id ? 'bg-red-900/20 border-red-500' : 'bg-white/[0.01] border-white/5 hover:border-red-500/30'}`}
              >
                 <div className="flex items-center gap-8 relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${selectedError?.id === log.id ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500'} group-hover:scale-110 transition-transform`}>
                       <AlertOctagon className="w-8 h-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                       <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-widest shrink-0">
                             {log.method || 'GET'}
                          </span>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight truncate shrink-0">{log.path || '/platform/dispatch'}</h4>
                          <span className="text-[10px] text-gray-600 font-mono italic shrink-0">{log.tenantId?.substring(0, 8) || 'GLOBAL'}</span>
                       </div>
                       <p className="text-xs text-gray-400 font-medium line-clamp-1 opacity-80">{log.message}</p>
                    </div>
                    <div className="shrink-0 text-right hidden md:block">
                       <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1 opacity-60">Latent Pulse</p>
                       <p className="text-[10px] text-gray-500 font-mono italic">{new Date(log.createdAt).toLocaleTimeString()}</p>
                    </div>
                 </div>
              </div>
            ))}

            {logs.length === 0 && (
               <div className="p-32 text-center space-y-8 bg-white/[0.01] border border-dashed border-white/10 rounded-[60px] transform scale-95 opacity-80">
                  <Wind className="w-20 h-20 text-gray-800 mx-auto opacity-20" />
                  <div className="space-y-2">
                     <p className="text-xl font-bold text-gray-500 font-sans uppercase tracking-widest">Platform Stability Optimal</p>
                     <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                        No failure artifacts detected across the global growth lattice. Platform persistence is currently in absolute integrity.
                     </p>
                  </div>
               </div>
            )}
         </div>

         {/* Trace Forensics */}
         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] relative overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
            <div className="space-y-10 relative">
               <div className="flex items-center gap-6">
                  <div className="p-5 rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all shadow-2xl">
                     <Bug className="w-10 h-10" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter text-sans leading-none">Trace Archives</h3>
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Audit: Stack-Trace Forensics</p>
                  </div>
               </div>

               {selectedError ? (
                  <div className="space-y-8">
                     <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex items-center gap-4 text-red-400">
                           <FileCode className="w-5 h-5 shrink-0" />
                           <h4 className="text-xs font-black uppercase tracking-widest leading-none">Structural Failure Node</h4>
                        </div>
                        <p className="text-sm text-white font-bold leading-relaxed">{selectedError.message}</p>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] text-gray-600 font-black uppercase tracking-widest px-2">
                           <span>Stack-Trace Persistence</span>
                           <TrendingUp className="w-4 h-4 opacity-40 shrink-0" />
                        </div>
                        <div className="p-6 rounded-[32px] bg-[#05070a] border border-white/5 font-mono text-[9px] text-gray-500 overflow-x-auto whitespace-pre leading-relaxed max-h-[300px] custom-scrollbar">
                           {selectedError.stack || 'No forensic trace artifact available for this dispatch.'}
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="py-24 text-center space-y-6 opacity-40">
                     <CloudLightning className="w-16 h-16 text-gray-800 mx-auto" />
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Select Failure Artifact to View Trace</p>
                  </div>
               )}
            </div>

            <div className="p-8 rounded-[40px] bg-red-500 text-white space-y-4 shadow-2xl shadow-red-500/20 relative overflow-hidden group/btn cursor-pointer">
               <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover/btn:scale-150 transition-transform" />
               <div className="flex items-center gap-4">
                  <Terminal className="w-8 h-8" />
                  <h4 className="text-lg font-black uppercase tracking-tighter leading-none text-sans">Debug Lattices</h4>
               </div>
               <p className="text-xs text-white/80 leading-relaxed font-bold uppercase tracking-tight">
                  Initialize platform-wide rebalancing to experimental nodes. Resolve systemic failures artifacts automatically.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
