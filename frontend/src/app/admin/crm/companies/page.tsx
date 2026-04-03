"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  Building, Mail, Phone, MapPin, Briefcase,
  Calendar, MoreVertical, Edit2, Send,
  MessageCircle, DownloadCloud, UploadCloud,
  Globe2, TrendingUp, DollarSign, Database
} from 'lucide-react';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  phone?: string;
  website?: string;
  _count?: {
    contacts: number;
    deals: number;
  };
  createdAt: string;
}

export default function CompaniesManagementPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/crm/companies');
      const json = await res.json();
      if (json.data) setCompanies(json.data);
    } catch (e) {
      toast.error('Failed to synchronize corporate artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

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
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                 Account Lattice Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Corporate-Orchestrator</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Corporate Artifacts</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Companies, B2B Accounts & Industry Segments</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <UploadCloud className="w-5 h-5" />
           </button>
           <button className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Provision Account
           </button>
        </div>
      </div>

      {/* Control Module */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
            <input 
               type="text" 
               placeholder="Search by corporate identifier, domain artifact, or industry vertical..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
         <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Industry Pulse</span>
            <select className="bg-transparent border-none outline-none text-xs text-indigo-400 font-bold uppercase tracking-widest">
               <option>All Verticals</option>
               <option>SaaS & Tech</option>
               <option>Manufacturing</option>
               <option>Finance Core</option>
            </select>
         </div>
         <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between group cursor-pointer hover:bg-emerald-500/10 transition-all">
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest leading-none">Export Digest</span>
            <DownloadCloud className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100 transition-all" />
         </div>
      </div>

      {/* Corporate Ledger */}
      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.01] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Corporate Identity</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Industry Vertical</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Connection Pulse</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Deal Vector</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Inspect</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.05]">
                  {companies.map((company) => (
                    <tr key={company.id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Building className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{company.name}</p>
                                <p className="text-[10px] text-gray-600 font-mono mt-0.5 uppercase tracking-tighter flex items-center gap-1.5">
                                   <Globe2 className="w-3 h-3 opacity-40 shrink-0" /> {company.domain || 'Local.artifact'}
                                </p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="space-y-1">
                             <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/5 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                {company.industry || 'General Industry'}
                             </span>
                             <p className="text-[10px] text-gray-600 font-medium uppercase tracking-tighter mt-1">{company.size || 'Unmapped'} Core Team</p>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <Users className="w-4 h-4 text-gray-600" />
                             <span className="text-sm font-black text-white">{company._count?.contacts || 0} <span className="text-[10px] text-gray-600 uppercase ml-1">Member Artifacts</span></span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <TrendingUp className="w-4 h-4 text-emerald-500" />
                             <span className="text-sm font-black text-white">{company._count?.deals || 0} <span className="text-[10px] text-gray-600 uppercase ml-1">Deal Vectors</span></span>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 text-gray-500">
                             <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:text-white hover:bg-white/10 transition-all">
                                <ExternalLink className="w-4 h-4" />
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
                  {companies.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-8 py-24 text-center">
                         <div className="flex flex-col items-center gap-6 text-gray-700">
                            <Building className="w-16 h-16 opacity-10" />
                            <div className="space-y-1">
                               <p className="text-lg font-bold text-gray-500 font-sans uppercase tracking-widest">No Corporate Artifacts Detected</p>
                               <p className="text-xs text-gray-600 font-medium">The workspace account lattice is currently unmapped. Initialize your first B2B account node now.</p>
                            </div>
                            <button onClick={fetchCompanies} className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                               Provision Corporate Node
                            </button>
                         </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Account Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] space-y-6 group relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="flex items-center gap-4">
               <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Database className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter">Domain Intelligence</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               Automatically aggregate contact artifacts based on corporate domain identifiers. Orchestrate account-level communication forensics with systemic precision.
            </p>
         </div>
         <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] space-y-6 group relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex items-center gap-4">
               <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <DollarSign className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter">Revenue Forecast</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               Analyze deal velocity and projected revenue artifacts across your corporate lattice. Identify high-value industry verticals for strategic orchestration.
            </p>
         </div>
         <div className="p-10 rounded-[40px] bg-emerald-600 to-indigo-700 text-white space-y-4 shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center gap-4 mb-2">
               <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
               </div>
               <div>
                  <h4 className="font-black text-sm uppercase tracking-widest leading-tight text-sans">Global B2B Pulse</h4>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-tighter italic">Status: Verified Cluster</p>
               </div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-bold uppercase tracking-tighter">
               Corporate artifacts are automatically enriched with systemic data from the global 'Enterprise-Knowledge-Lattice' every 24 hours.
            </p>
            <button onClick={fetchCompanies} className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">
               Scrub Account Manifest
            </button>
         </div>
      </div>

    </div>
  );
}
