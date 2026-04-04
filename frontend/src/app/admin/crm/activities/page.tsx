"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  MessageSquare, Mail, Phone, Calendar,
  MoreVertical, Edit2, Send, History,
  User, Building, Target, Clock, Bot,
  MousePointer2, ZapOff, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface Activity {
  id: string;
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE' | 'STAGE_CHANGE' | 'TASK' | 'AI_INTERACTION';
  subject: string;
  description?: string;
  contact?: { firstName: string, lastName: string };
  deal?: { name: string };
  user?: { name: string };
  metadata?: any;
  createdAt: string;
}

export default function ActivitiesManagementPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/crm/activities');
      const json = await res.json();
      if (json.data) setActivities(json.data);
    } catch (e) {
      toast.error('Failed to synchronize activity artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return <Mail className="w-5 h-5 text-indigo-500" />;
      case 'CALL': return <Phone className="w-5 h-5 text-emerald-500" />;
      case 'MEETING': return <Calendar className="w-5 h-5 text-amber-500" />;
      case 'AI_INTERACTION': return <Bot className="w-5 h-5 text-purple-500" />;
      case 'STAGE_CHANGE': return <Target className="w-5 h-5 text-blue-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Interaction Lattice Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Engagement-History</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Activity Forensic Feed</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Monitor Communications, Interactions & CRM Event Stream</p>
        </div>
        <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2">
           <Plus className="w-4 h-4" /> Log Manual Activity
        </button>
      </div>

      {/* Control Module */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
            <input 
               type="text" 
               placeholder="Search event subject, contact artifact, or activity node..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
         <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Event Pulse</span>
            <select className="bg-transparent border-none outline-none text-xs text-indigo-400 font-bold uppercase tracking-widest">
               <option>All Dispatches</option>
               <option>Communications</option>
               <option>AI Operations</option>
               <option>State Changes</option>
            </select>
         </div>
         <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between group cursor-pointer hover:bg-indigo-500/10 transition-all">
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest leading-none">Scrub Timeline</span>
            <RefreshCw onClick={fetchActivities} className="w-4 h-4 text-indigo-400 opacity-60 group-hover:rotate-180 transition-all duration-500" />
         </div>
      </div>

      {/* Activity Timeline Feed */}
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-10 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/[0.05] before:to-transparent">
         {activities.map((activity, idx) => (
            <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group md:px-10">
               {/* Timeline Dot */}
               <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#0b0f19] border border-white/5 shadow-2xl absolute left-0 md:left-1/2 -translate-x-1/2 group-hover:border-indigo-500/40 transition-all">
                  {getActivityIcon(activity.type)}
               </div>
               
               {/* Content Card */}
               <div className="w-[calc(100%-60px)] md:w-[calc(50%-40px)] p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] group-hover:bg-white/[0.03] group-hover:border-indigo-500/10 transition-all relative overflow-hidden ml-auto md:ml-0 shadow-2xl">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors" />
                  
                  <div className="flex items-center justify-between mb-4">
                     <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500">
                        {activity.type} Artifact
                     </span>
                     <span className="flex items-center gap-2 text-[10px] text-gray-600 font-mono italic">
                        <Clock className="w-3.5 h-3.5 opacity-40 shrink-0" /> {new Date(activity.createdAt).toLocaleString()}
                     </span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight mb-2 truncate">{activity.subject}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-6 font-medium">{activity.description || 'System-generated interaction artifact recorded on the workspace communication lattice.'}</p>

                  <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/5">
                     {activity.contact && (
                        <div className="flex items-center gap-2">
                           <User className="w-4 h-4 text-indigo-400 opacity-40" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{activity.contact.firstName} {activity.contact.lastName}</span>
                        </div>
                     )}
                     {activity.deal && (
                        <div className="flex items-center gap-2">
                           <Target className="w-4 h-4 text-emerald-400 opacity-40" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{activity.deal.name}</span>
                        </div>
                     )}
                     <div className="ml-auto flex items-center gap-2">
                         <Briefcase className="w-3.5 h-3.5 text-gray-700" />
                         <span className="text-[9px] text-gray-700 uppercase font-bold tracking-widest">{activity.user?.name || 'Workspace Agent'}</span>
                     </div>
                  </div>
               </div>
            </div>
         ))}

         {activities.length === 0 && !loading && (
            <div className="p-24 text-center space-y-8 bg-white/[0.01] border border-dashed border-white/10 rounded-[60px] mx-10 transform scale-95 opacity-80">
               <History className="w-20 h-20 text-gray-800 mx-auto opacity-20" />
               <div className="space-y-2">
                  <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Communication Lattice Silent</p>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                     The engagement history is currently empty for this workspace cluster. Manual dispatches or AI interactions will propagate to this timeline in real-time.
                  </p>
               </div>
               <button onClick={fetchActivities} className="px-10 py-4 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-2xl shadow-indigo-500/40">
                  Scrub Workspace Events
               </button>
            </div>
         )}
      </div>

      {/* Intelligence Dashboard Redirect */}
      <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-10 group overflow-hidden relative">
         <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] border border-indigo-500/20 opacity-0 group-hover:opacity-100 transition-all" />
         <div className="flex items-center gap-8 relative">
            <div className="p-6 rounded-[32px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
               <Zap className="w-12 h-12" />
            </div>
            <div className="space-y-2">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Interaction Velocity Forensics</h3>
               <p className="text-sm text-gray-500 max-w-xl font-medium uppercase tracking-tighter opacity-60">Analyze Relationship Persistence & Dispatch Health artifacts</p>
            </div>
         </div>
         <button className="px-10 py-5 bg-white text-[#0b0f19] rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10 shrink-0 relative">
            Orchestrate Intelligence
         </button>
      </div>

    </div>
  );
}
