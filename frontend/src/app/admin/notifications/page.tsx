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
  Bell, Mail, MessageSquare, Megaphone,
  Radio, Signal, Wifi, Volume2, Info,
  CheckCircle, ZapOff, Bookmark, Target
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  timestamp: string;
  source: string;
}

export default function WorkspaceCommunicationsDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([
     { id: '1', title: 'Identity Lattice Synchronized', message: 'Workspace identity artifacts have been committed to the global persistence lattice.', type: 'SUCCESS', read: false, timestamp: new Date().toISOString(), source: 'Security-Core' },
     { id: '2', title: 'Monetization Threshold Alert', message: 'Subscription billing cycle failed to initialize for cluster node: Alpha-42.', type: 'ERROR', read: false, timestamp: new Date(Date.now() - 3600000).toISOString(), source: 'Finance-Hub' },
     { id: '3', title: 'Structural Upgrade Pending', message: 'New platform engine artifacts (v4.2.0) are available for deployment.', type: 'INFO', read: true, timestamp: new Date(Date.now() - 86400000).toISOString(), source: 'System-Eng' },
  ]);
  const [loading, setLoading] = useState(false);

  const markAllRead = () => {
     setNotifications(prev => prev.map(n => ({...n, read: true})));
     toast.success('Communication artifacts marked as acknowledged');
  };

  const getStatusColor = (type: string) => {
     switch(type) {
        case 'SUCCESS': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        case 'ERROR': return 'text-red-500 bg-red-500/10 border-red-500/20';
        case 'WARNING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
     }
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
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Communication Node Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Notification-Orchestrator</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Workspace Communications</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Structural alerts, systemic Events & engagement forensics</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
              onClick={markAllRead}
              className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group"
           >
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Acknowledge All
           </button>
        </div>
      </div>

      {/* Communication Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Unread Artifacts', value: notifications.filter(n => !n.read).length, icon: Bell, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Engagement Velocity', value: 'High', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Platform Stability', value: '99.9%', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
           { label: 'Integrity Alerts', value: notifications.filter(n => n.type === 'ERROR').length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
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

      {/* Notification Feed */}
      <div className="space-y-6">
         {notifications.map((notif) => (
           <div key={notif.id} className={`p-10 rounded-[60px] bg-white/[0.01] border transition-all group flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden ${!notif.read ? 'border-indigo-500/20 bg-indigo-500/[0.01]' : 'border-white/[0.05]'}`}>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-indigo-500/5 transition-colors" />
              
              <div className={`w-20 h-20 rounded-[32px] border flex items-center justify-center transition-all shrink-0 shadow-2xl ${getStatusColor(notif.type)} group-hover:scale-105`}>
                 {notif.type === 'ERROR' ? <AlertCircle className="w-10 h-10" /> : <Info className="w-10 h-10" />}
              </div>

              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-4 mb-3 flex-wrap">
                    {!notif.read && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />}
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate">{notif.title}</h3>
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest bg-white/[0.03] border border-white/10 px-2 py-0.5 rounded-md shrink-0">{notif.source} dispatch</span>
                 </div>
                 <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-2xl uppercase tracking-tight opacity-80">{notif.message}</p>
              </div>

              <div className="flex items-center gap-8 shrink-0 relative">
                 <div className="hidden lg:block text-right pr-8 border-r border-white/5">
                    <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1 opacity-60">Received</p>
                    <p className="text-sm font-black text-white uppercase tracking-tighter">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                 </div>
                 <div className="flex gap-4">
                    <button className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 text-gray-700 hover:text-white transition-all shadow-xl">
                       <Eye className="w-6 h-6" />
                    </button>
                    <button className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 text-gray-700 hover:text-red-400 transition-all shadow-xl">
                       <Trash2 className="w-6 h-6" />
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Engagement persistence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[40px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl shadow-indigo-500/20">
               <Megaphone className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative text-sans">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Internal Dispatches</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80 pt-2 font-sans">
                  Execute structural workspace announcements. Maintain absolute interaction persistence across all functional unit members.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[40px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl shadow-emerald-500/20">
               <Signal className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative text-sans">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Platform Pulse</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80 pt-2 font-sans">
                  Analyze systemic engagement forensics. Identify structural communication divergences and initialize recovery dispatches in real-time.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
