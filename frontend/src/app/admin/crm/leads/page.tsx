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
  Target, Magnet, TrendingUp, BarChart3,
  MousePointer2, MessageSquare, Phone,
  Mail, Users2, Rocket, ZapOff
} from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  source: string;
  score: number;
  assignedTo?: string;
  createdAt: string;
}

export default function AdministrativeLeadIntelligencePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/crm/leads');
      const json = await res.json();
      if (json.data) setLeads(json.data);
    } catch (e) {
      toast.error('Failed to synchronize lead intelligence artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('new')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (s.includes('contacted')) return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    if (s.includes('lost')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
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
                 Lead Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: CRM-Lead-Orchestrator</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Lead Intelligence Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage human artifacts, conversion forensics & team-attribution dispatches</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchLeads} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <RefreshCw className="w-5 h-5" />
           </button>
           <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group">
              <Plus className="w-4 h-4" /> Provision Lead Node
           </button>
        </div>
      </div>

      {/* Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Active Leads', value: leads.length, icon: Users2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Conversion Pulse', value: '18.4%', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Engagement Velocity', value: 'High', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Platform Integrity', value: 'Verified', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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

      {/* Control Module */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="w-full md:max-w-md p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all shadow-inner">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
            <input 
               type="text" 
               placeholder="Search lead artifact, email, or attribution node..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
         <div className="flex items-center gap-4">
            <button className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-gray-600 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
               <Filter className="w-4 h-4" /> Attributes
            </button>
            <button className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-gray-600 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
               <Download className="w-4 h-4" /> Export Archive
            </button>
         </div>
      </div>

      {/* Lead Feed */}
      <div className="p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden shadow-2xl">
         <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
         
         <div className="overflow-x-auto relative">
            <table className="w-full border-collapse">
               <thead>
                  <tr className="border-b border-white/5">
                     <th className="text-left py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none">Identity artifact</th>
                     <th className="text-left py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none">Status node</th>
                     <th className="text-left py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none">Score pulse</th>
                     <th className="text-left py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none">Source lattice</th>
                     <th className="text-left py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none">Attribution</th>
                     <th className="text-right py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none">Forensics</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="group hover:bg-white/[0.01] transition-colors">
                       <td className="py-8 px-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-2xl">
                                <User className="w-6 h-6" />
                             </div>
                             <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{lead.name || 'Anonymous Node'}</h4>
                                <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest mt-0.5">{lead.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-8 px-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(lead.status)}`}>
                             {lead.status || 'UNRANKED'}
                          </span>
                       </td>
                       <td className="py-8 px-4">
                          <div className="flex items-center gap-3">
                             <span className="text-lg font-black text-white uppercase tracking-tighter">{lead.score || 0}</span>
                             <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${lead.score}%` }} />
                             </div>
                          </div>
                       </td>
                       <td className="py-8 px-4">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                             <Globe className="w-3.5 h-3.5 opacity-40 shrink-0" /> {lead.source || 'Organic Dispatch'}
                          </span>
                       </td>
                       <td className="py-8 px-4">
                          <span className="text-[10px] text-white font-black uppercase tracking-widest bg-white/[0.03] border border-white/5 px-3 py-1 rounded-lg">
                             {lead.assignedTo || 'Unassigned Node'}
                          </span>
                       </td>
                       <td className="py-8 px-4 text-right">
                          <button className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-gray-700 hover:text-white transition-all shadow-lg">
                             <Eye className="w-5 h-5" />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>

            {leads.length === 0 && (
               <div className="p-32 text-center space-y-8 opacity-80">
                  <Magnet className="w-20 h-20 text-gray-800 mx-auto opacity-20" />
                  <div className="space-y-2">
                     <p className="text-xl font-bold text-gray-500 font-sans uppercase tracking-widest">Lead Lattices Empty</p>
                     <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed uppercase tracking-tight">
                        Platform lead artifacts will propagate to this ledger in real-time. Deploy outreach dispatches to initialize lead growth.
                     </p>
                  </div>
                  <button className="px-10 py-4 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-2xl shadow-indigo-500/40">
                     Initialize Outreach Node
                  </button>
               </div>
            )}
         </div>
      </div>

      {/* Persistence Strategy Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[38px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0">
               <TrendingUp className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Conversion Yield</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Analyze structural lead yield dispatches. Verify conversion forensics across functional unit nodes globally.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-pink-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[38px] bg-pink-500/10 text-pink-500 border border-pink-500/20 group-hover:bg-pink-500 group-hover:text-white transition-all relative shrink-0">
               <Rocket className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Growth Dispatches</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Orchestrate high-velocity lead acquisition dispatches. Deploy structural outreach artifacts to global discovery nodes.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
