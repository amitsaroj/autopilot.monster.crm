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
  Contact2, Mail, Phone, MapPin, Building2,
  Calendar, Fingerprint, Linkedin, Twitter,
  MessageCircle, Hash, Briefcase, Award
} from 'lucide-react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  status: string;
  lastContactedAt?: string;
  createdAt: string;
}

export default function AdministrativeContactIntelligencePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/crm/contacts');
      const json = await res.json();
      if (json.data) setContacts(json.data);
    } catch (e) {
      toast.error('Failed to synchronize contact intelligence artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

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
                 Identity Observer Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: CRM-Contact-Orchestrator</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Contact Intelligence Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage human identity artifacts, account forensics & engagement history</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchContacts} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <RefreshCw className="w-5 h-5" />
           </button>
           <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group">
              <Plus className="w-4 h-4" /> Provision Identity Node
           </button>
        </div>
      </div>

      {/* Identity Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Active Identities', value: contacts.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Engagement Pulse', value: 'High', icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Platform Retention', value: '94.2%', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
           { label: 'Integrity Check', value: 'Verified', icon: Fingerprint, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
               placeholder="Search identity artifact, company node, or jobId..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
         <div className="flex items-center gap-4">
            <button className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-gray-600 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest leading-none">
               <Download className="w-4 h-4" /> Export Identity Archive
            </button>
         </div>
      </div>

      {/* identity Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {contacts.map((contact) => (
           <div key={contact.id} className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all group flex flex-col justify-between h-[450px] relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors" />
              
              <div>
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 rounded-[28px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-2xl">
                       <User className="w-10 h-10" />
                    </div>
                    <div className="flex gap-2">
                       <button className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-gray-600 hover:text-white transition-all">
                          <Settings className="w-5 h-5" />
                       </button>
                    </div>
                 </div>

                 <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight mb-2 leading-none">{contact.name || 'Anonymous Node'}</h3>
                 <p className="text-[11px] text-gray-600 font-black uppercase tracking-widest opacity-80 flex items-center gap-2 mb-6">
                    <Briefcase className="w-3.5 h-3.5 opacity-40 shrink-0" /> {contact.jobTitle || 'Executive Node'} • {contact.companyName || 'Corporate Lattice'}
                 </p>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                       <Mail className="w-4 h-4 opacity-40 shrink-0" /> {contact.email}
                    </div>
                    {contact.phone && (
                       <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                          <Phone className="w-4 h-4 opacity-40 shrink-0" /> {contact.phone}
                       </div>
                    )}
                 </div>
              </div>

              <div className="space-y-6 pt-10">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none">
                       <Clock className="w-4 h-4 opacity-40 shrink-0" /> Contacted {contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString() : 'NEVER'}
                    </div>
                    <div className="flex gap-3">
                       <Linkedin className="w-4 h-4 text-gray-800 hover:text-blue-500 transition-colors cursor-pointer" />
                       <Twitter className="w-4 h-4 text-gray-800 hover:text-blue-400 transition-colors cursor-pointer" />
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="flex-1 py-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
                       <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> View artifact
                    </button>
                    <button className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-gray-700 hover:text-red-400 transition-all">
                       <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>
         ))}

         {/* Blueprint Placeholder for New Identities */}
         <div className="p-10 rounded-[60px] border border-dashed border-white/10 bg-indigo-500/[0.01] flex flex-col items-center justify-center text-center space-y-8 group cursor-pointer hover:border-indigo-500/30 transition-all h-[450px]">
            <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
               <Plus className="w-12 h-12" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight font-sans">Initialize Identity</h3>
               <p className="text-sm text-gray-600 max-w-[240px] mx-auto leading-relaxed mt-3 uppercase tracking-widest font-black opacity-30">Identity Slot: Available</p>
            </div>
            <button className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:underline">
               Deploy Identity Dispatch <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* persistence Strategy Cluser */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
         <div className="p-12 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[40px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl shadow-indigo-500/20">
               <History className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Identity Persistence</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Analyze structural identity artifacts. Track systemic engagement history and identity forensics across global resource clusters.
               </p>
            </div>
         </div>
         <div className="p-12 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
            <div className="p-8 rounded-[40px] bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl shadow-blue-500/20">
               <Building2 className="w-14 h-14" />
            </div>
            <div className="space-y-4 relative">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-sans leading-none">Account Lattices</h3>
               <p className="text-base text-gray-500 font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
                  Manage corporate identity artifacts. Orchestrate functional unit attribution and account persistence across the workspace growth lattice.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
