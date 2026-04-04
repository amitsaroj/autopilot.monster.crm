"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  UserPlus, UserCheck, Shield, Mail, MoreVertical,
  Edit2, Ban, CheckCircle, Clock, Smartphone,
  Hash, ShieldAlert, Award, Grid, List as ListIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'DEACTIVATED';
  lastLogin?: string;
  avatar?: string;
}

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/users');
      const json = await res.json();
      if (json.data) setMembers(json.data);
    } catch (e) {
      toast.error('Failed to synchronize team artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: any = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      DEACTIVATED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors: any = {
      TENANT_ADMIN: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      USER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      SUPER_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${colors[role] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
        {role.replace('_', ' ')}
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Identity Lattices Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Team-Orchestrator</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Team Identity Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Personnel Artifacts, RBAC Assignments & Identity persistence</p>
        </div>
        <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group">
           <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Provision Team Node
        </button>
      </div>

      {/* Persistence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Total identities', value: members.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'Active Persistence', value: members.filter(m => m.status === 'ACTIVE').length, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Pending Dispatches', value: members.filter(m => m.status === 'PENDING').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'RBAC Divergences', value: '0', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
         ].map((stat) => (
           <div key={stat.label} className="p-6 rounded-[32px] bg-white/[0.01] border border-white/[0.05] flex items-center gap-6 group hover:bg-white/[0.02] transition-all">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
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
               placeholder="Search identity moniker, email node, or RBAC role..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex bg-white/[0.02] border border-white/5 rounded-xl p-1 shrink-0">
               <button className="p-2 rounded-lg bg-indigo-500 text-white shadow-xl"><Grid className="w-4 h-4" /></button>
               <button className="p-2 rounded-lg text-gray-600 hover:text-white transition-all"><ListIcon className="w-4 h-4" /></button>
            </div>
            <button onClick={fetchMembers} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all shrink-0">
               <RefreshCw className="w-5 h-5" />
            </button>
         </div>
      </div>

      {/* Identity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {members.map((member) => (
           <div key={member.id} className="p-8 rounded-[40px] bg-white/[0.01] border border-white/[0.05] hover:border-indigo-500/20 transition-all group relative overflow-hidden flex flex-col justify-between h-[380px]">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors" />
              
              <div>
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xl group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl">
                       {member.name?.charAt(0) || 'U'}
                    </div>
                    <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-gray-600 hover:text-white transition-all">
                       <MoreVertical className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate leading-none">{member.name || 'Anonymous Entity'}</h3>
                       <p className="text-[10px] text-gray-600 font-mono mt-1.5 uppercase tracking-tighter flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 opacity-40 shrink-0" /> {member.email}
                       </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap pt-2">
                       {getRoleBadge(member.role)}
                       {getStatusBadge(member.status)}
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[9px] text-gray-700 font-black uppercase tracking-widest">
                       <Clock className="w-3.5 h-3.5 opacity-40 shrink-0" /> Latent {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-gray-700 font-black uppercase tracking-widest">
                       <Smartphone className="w-3.5 h-3.5 opacity-40 shrink-0" /> Device Verified
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button className="flex-1 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 group/btn">
                       <Edit2 className="w-4 h-4 text-indigo-500 group-hover/btn:scale-110 transition-transform" /> Edit Identity
                    </button>
                    <button className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-600 hover:text-red-400 transition-all">
                       <Ban className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </div>
         ))}

         {/* Blueprint Placeholder for New Invitations */}
         <div className="p-8 rounded-[40px] border border-dashed border-white/10 bg-indigo-500/[0.01] flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover:border-indigo-500/30 transition-all h-[380px]">
            <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
               <UserPlus className="w-10 h-10" />
            </div>
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight font-sans">Invite New Agent</h3>
               <p className="text-sm text-gray-600 max-w-[220px] mx-auto leading-relaxed mt-2 uppercase tracking-widest font-black opacity-30">Identity Slot: Available</p>
            </div>
            <button className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:underline">
               Initialize Invitation Dispatch <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Governance & Compliance Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="p-10 rounded-[60px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="p-6 rounded-[32px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl">
               <Award className="w-12 h-12" />
            </div>
            <div className="space-y-3 relative">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">Resource Inheritance</h3>
               <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm">
                  Manage how new team nodes inherit workspace artifacts. Orchestrate automated data-permission dispatches for high-velocity onboarding.
               </p>
            </div>
         </div>
         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />
            <div className="p-6 rounded-[32px] bg-purple-500/10 text-purple-500 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all relative shrink-0 shadow-2xl">
               <ShieldCheck className="w-12 h-12" />
            </div>
            <div className="space-y-3 relative">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-sans leading-none">RBAC Policy Audit</h3>
               <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm">
                  Conduct structural identity audits to ensure absolute RBAC compliance. Track policy-divergences across your entire workspace identity lattice.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
