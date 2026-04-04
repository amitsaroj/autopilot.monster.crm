"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  MessageSquare, Inbox, Clock, User,
  Flag, Tag, MoreVertical, Edit2,
  CheckCircle, LifeBuoy, Hash, Heart,
  AlertTriangle, FilterX
} from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/support/tickets');
      const json = await res.json();
      if (json.data) setTickets(json.data);
    } catch (e) {
      toast.error('Failed to synchronize support artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getPriorityBadge = (priority: string) => {
    const colors: any = {
      URGENT: 'bg-red-500/10 text-red-500 border-red-500/20',
      HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${colors[priority]}`}>
        {priority} PRIORITY
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      OPEN: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      PENDING_CUSTOMER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      CLOSED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${colors[status]}`}>
        {status}
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Support Lattice Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Help-Desk-Orchestrator</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Support Artifacts</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Customer Requests, Ticket Persistence & Help-Desk Forensics</p>
        </div>
        <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2">
           <Plus className="w-4 h-4 text-indigo-500" /> Provision Support Node
        </button>
      </div>

      {/* Persistence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Requests', value: '1.4k', icon: Inbox, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Mean Resolution', value: '4.2h', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Urgent Artifacts', value: '12', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
           { label: 'Satisfaction Pulse', value: '98%', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
         ].map((stat) => (
           <div key={stat.label} className="p-6 rounded-[32px] bg-white/[0.01] border border-white/[0.05] flex items-center gap-6 group hover:bg-white/[0.02] transition-all">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-0.5">{stat.label}</p>
                 <p className="text-xl font-black text-white uppercase tracking-tighter">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Ticket Ledger */}
      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.01] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ticket Identity</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Metadata status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Priority Forensics</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Inspect</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.05]">
                  {tickets.map((t) => (
                    <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <LifeBuoy className="w-6 h-6 shrink-0" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{t.subject}</p>
                                <p className="text-[10px] text-gray-600 font-mono mt-0.5 uppercase tracking-tighter flex items-center gap-1.5 shrink-0 truncate max-w-[200px]">
                                   REF: {t.ticketNumber}
                                </p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="space-y-1">
                             {getStatusBadge(t.status)}
                             <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Latent {new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          {getPriorityBadge(t.priority)}
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 text-gray-500">
                             <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:text-white hover:bg-white/10 transition-all">
                                <MessageSquare className="w-4 h-4" />
                             </button>
                             <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:text-indigo-400 transition-all">
                                <Edit2 className="w-4 h-4" />
                             </button>
                             <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:text-red-400 transition-all">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="px-8 py-24 text-center">
                         <div className="flex flex-col items-center gap-6 text-gray-700">
                            <LifeBuoy className="w-16 h-16 opacity-10" />
                            <div className="space-y-1">
                               <p className="text-lg font-bold text-gray-500 font-sans uppercase tracking-widest">Support Lattice Calm</p>
                               <p className="text-xs text-gray-600 font-medium">No unresolved support artifacts detected in this workspace cluster. Customer satisfaction pulse is currently optimal.</p>
                            </div>
                            <button onClick={fetchTickets} className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
                               Initialize Support Dispatch
                            </button>
                         </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Knowledge Base & Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] space-y-8 group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                     <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Knowledge Base Forensics</h3>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Utilize workspace self-service artifacts to reduce ticket volume. Orchestrate automated resolution patterns using platform-wide intelligence dispatches.
               </p>
            </div>
            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Total KB Artifacts: 42</span>
                <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:underline">
                   Manage Help-Center <ArrowRight className="w-4 h-4" />
                </button>
            </div>
         </div>

         <div className="p-10 rounded-[60px] bg-indigo-500 to-purple-600 text-white space-y-8 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-[24px] bg-white/20 backdrop-blur-md border border-white/20">
                  <Zap className="w-10 h-10 text-white" />
               </div>
               <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">AI Agent Support</h3>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-1">Status: Agent-Core Active</p>
               </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed font-bold uppercase tracking-tight">
               Enable automated ticket resolution dispatches. AI agents can autonomously resolve level-1 artifacts using your workspace's deep knowledge lattice.
            </p>
            <button className="w-full py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">
               Deploy Support Agent
            </button>
         </div>
      </div>

    </div>
  );
}
