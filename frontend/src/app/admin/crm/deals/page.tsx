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
  DollarSign, Briefcase, TrendingUp, BarChart3,
  MousePointer2, MessageSquare, Phone,
  Mail, Users2, Rocket, Workflow, Target,
  FileText, Coins, Award, Building2
} from 'lucide-react';
import { toast } from 'sonner';

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  contact?: { name: string };
  company?: { name: string };
  createdAt: string;
}

export default function AdministrativeDealIntelligencePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/crm/deals');
      const json = await res.json();
      if (json.data) setDeals(json.data);
    } catch (e) {
      toast.error('Failed to synchronize deal intelligence artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const getStageBadge = (stage: string) => {
    const s = stage.toLowerCase();
    if (s.includes('closed')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s.includes('negotiation')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (s.includes('discovery')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-white/5 text-gray-500 border-white/10';
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const totalValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Revenue Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: CRM-Deal-Orchestrator</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Deal Intelligence Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage financial artifacts, pipeline forensics & stage-velocity dispatches</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchDeals} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <RefreshCw className="w-5 h-5" />
           </button>
           <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group">
              <Plus className="w-4 h-4" /> Provision Deal Node
           </button>
        </div>
      </div>

      {/* Financial ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Pipeline Volume', value: `$${(totalValue / 1000).toFixed(1)}k`, icon: Coins, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Active Deals', value: deals.length, icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Closing Velocity', value: 'Moderate', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Structural Yield', value: 'OPTIMAL', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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
               placeholder="Search deal moniker, company artifact, or stage lattice..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
         <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between min-w-[150px]">
               <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Stage Filter</span>
               <Filter className="w-4 h-4 text-indigo-400 opacity-60" />
            </div>
            <button className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
               <Workflow className="w-4 h-4" /> Automate Pipeline
            </button>
         </div>
      </div>

      {/* Deal Feed */}
      <div className="p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden shadow-2xl">
         <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
         
         <div className="overflow-x-auto relative">
            <table className="w-full border-collapse">
               <thead>
                  <tr className="border-b border-white/5">
                     <th className="text-left py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none text-sans">Financial artifact</th>
                     <th className="text-left py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none text-sans">Stage node</th>
                     <th className="text-left py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none text-sans">Probability</th>
                     <th className="text-left py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none text-sans">Expected Close</th>
                     <th className="text-left py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none text-sans">Attribution</th>
                     <th className="text-right py-6 px-4 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none text-sans">Forensics</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="group hover:bg-white/[0.01] transition-colors">
                       <td className="py-8 px-4">
                          <div className="flex items-center gap-6">
                             <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-2xl">
                                <DollarSign className="w-8 h-8" />
                             </div>
                             <div>
                                <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-2">{deal.name || 'Untitled Engagement'}</h4>
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] text-white font-black uppercase tracking-tighter bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20">${deal.value?.toLocaleString()}</span>
                                   <span className="text-[10px] text-gray-600 font-medium uppercase tracking-widest leading-none opacity-60">Value dispatch</span>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="py-8 px-4">
                          <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStageBadge(deal.stage)}`}>
                             {deal.stage || 'UNRANKED'}
                          </span>
                       </td>
                       <td className="py-8 px-4">
                          <div className="flex items-center gap-3">
                             <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${deal.probability}%` }} />
                             </div>
                             <span className="text-sm font-black text-white uppercase tracking-tighter">{deal.probability}%</span>
                          </div>
                       </td>
                       <td className="py-8 px-4">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2 leading-none">
                             <Clock className="w-4 h-4 opacity-40 shrink-0" /> {new Date(deal.expectedCloseDate).toLocaleDateString()}
                          </span>
                       </td>
                       <td className="py-8 px-4">
                          <div className="space-y-1.5">
                             <p className="text-[10px] text-white font-black uppercase tracking-widest leading-none">{deal.contact?.name || 'Identity Unknown'}</p>
                             <p className="text-[10px] text-gray-700 font-medium uppercase tracking-tighter italic opacity-60">{deal.company?.name || 'Company Anonymous'}</p>
                          </div>
                       </td>
                       <td className="py-8 px-4 text-right">
                          <button className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-700 hover:text-white transition-all shadow-xl">
                             <Eye className="w-6 h-6" />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>

            {deals.length === 0 && (
               <div className="p-32 text-center space-y-8 opacity-80">
                  <Coins className="w-20 h-20 text-gray-800 mx-auto opacity-20" />
                  <div className="space-y-2">
                     <p className="text-xl font-bold text-gray-500 font-sans uppercase tracking-widest">Financial Lattices Empty</p>
                     <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed uppercase tracking-tight">
                        Platform deal artifacts will propagate to this ledger in real-time. Deploy structural pipeline dispatches to initialize revenue growth.
                     </p>
                  </div>
                  <button className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/40">
                     Initialize Pipeline Dispatch
                  </button>
               </div>
            )}
         </div>
      </div>

      {/* operational Persistence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[38px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl">
               <TrendingUp className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Pipeline Velocity</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Analyze structural pipeline dispatches. Track stage-conversion forensics and deal-velocity across functional unit nodes.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[38px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl">
               <Award className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Deal Certification</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Verify structural financial artifacts. Ensure absolute integrity of every closed-won deal node before platform settlement dispatches.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
