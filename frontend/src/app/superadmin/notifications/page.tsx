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
  Megaphone, Radio, Signal, Wifi, Volume2, Info,
  CheckCircle, ZapOff, Bookmark, Target,
  CloudLightning, Key, Lock, Network, Share2, Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface GlobalNotification {
  id: string;
  scope: 'SYSTEM' | 'MAINTENANCE' | 'SECURITY' | 'MARKETING';
  title: string;
  message: string;
  recipients: string;
  status: 'DRAFTE' | 'DISPATCHED' | 'MAINTAINED';
  timestamp: string;
}

export default function PlatformCommunicationsOrchestrator() {
  const [globalNotifs, setGlobalNotifs] = useState<GlobalNotification[]>([
     { id: 'GN-1001', scope: 'MAINTENANCE', title: 'Global Engine Re-provisioning', message: 'Cluster Alpha nodes will undergo structural maintenance at 04:00 UTC. System persistence will remain active.', recipients: 'All Tenants', status: 'DISPATCHED', timestamp: new Date().toISOString() },
     { id: 'GN-1002', scope: 'SECURITY', title: 'Identity Shield Upgrade', message: 'Mandatory MFA artifacts will be dispatched to all workspace administrators to ensure lattice integrity.', recipients: 'Admins Only', status: 'DRAFTE', timestamp: new Date(Date.now() + 86400000).toISOString() },
     { id: 'GN-1003', scope: 'SYSTEM', title: 'Marketplace Lattice Expansion', message: 'New extension discovery nodes are now active across the global growth cluster.', recipients: 'All Users', status: 'DISPATCHED', timestamp: new Date(Date.now() - 172800000).toISOString() },
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
                 Platform Broadcast Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Global-Notification-Hub</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Platform Communications</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Structural broadcasts, systemic Alerts & global Engagement forensics</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group">
              <Megaphone className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" /> Initialize Broadcast
           </button>
        </div>
      </div>

      {/* Broadcast Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Platform Reach', value: '1.2m Nodes', icon: Radio, color: 'text-blue-500', bg: 'bg-blue-500/10' },
           { label: 'Dispatch Velocity', value: 'High-P', icon: CloudLightning, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Lattice Awareness', value: '98.2%', icon: Signal, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Active Alerts', value: globalNotifs.length, icon: Bell, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
         ].map((stat) => (
           <div key={stat.label} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.03] transition-all relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors" />
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

      {/* Broadcast Feed */}
      <div className="space-y-6">
         {globalNotifs.map((notif) => (
           <div key={notif.id} className="p-12 rounded-[60px] bg-white/[0.01] border border-white/[0.05] hover:border-blue-500/20 transition-all group flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-inner">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/[0.01] rounded-full blur-[100px] group-hover:bg-blue-500/5 transition-colors shadow-2xl" />
              
              <div className={`w-24 h-24 rounded-[40px] bg-white/[0.03] border border-white/5 flex items-center justify-center transition-all shrink-0 shadow-2xl ${notif.scope === 'SECURITY' ? 'text-red-500' : 'text-blue-400'} group-hover:bg-blue-500 group-hover:text-white`}>
                 {notif.scope === 'SECURITY' ? <ShieldCheck className="w-12 h-12" /> : <Volume2 className="w-12 h-12" />}
              </div>

              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-5 mb-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${notif.status === 'DISPATCHED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                       {notif.status}
                    </span>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight truncate">{notif.title}</h3>
                 </div>
                 <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-3xl uppercase tracking-tight opacity-80 pt-2">{notif.message}</p>
                 <div className="flex items-center gap-8 mt-8 text-[11px] text-gray-600 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2 px-1"><Users className="w-4 h-4 opacity-40 shrink-0" /> Recipients: {notif.recipients}</span>
                    <span className="opacity-20">•</span>
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 opacity-40 shrink-0" /> Dispatch: {new Date(notif.timestamp).toLocaleTimeString()}</span>
                    <span className="opacity-20">•</span>
                    <span className="flex items-center gap-2"><Globe className="w-4 h-4 opacity-40 shrink-0" /> Scope: {notif.scope} artifact</span>
                 </div>
              </div>

              <div className="flex flex-col gap-6 shrink-0 relative">
                 <button className="px-10 py-5 bg-white text-[#0b0f19] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/10">
                    Inspect analytics
                 </button>
                 <div className="flex gap-4 px-2">
                    <button className="flex-1 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-gray-700 hover:text-white transition-all shadow-lg">
                       <Settings className="w-5 h-5 flex m-auto" />
                    </button>
                    <button className="flex-1 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-gray-700 hover:text-red-400 transition-all shadow-lg">
                       <Trash2 className="w-5 h-5 flex m-auto" />
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Operational Broadcast Persistence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[40px] bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl">
               <Network className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Broadcast Topology</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80 pt-2">
                  Maintain global platform awareness. Orchestrate structural dispatches across geographical node distribution in real-time.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[40px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl">
               <Share2 className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Dispatch Hub</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80 pt-2">
                  Verify systemic engagement forensics. Track structural broadcast-velocity and identity-attribution pulse globally.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
