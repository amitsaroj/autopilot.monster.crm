"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  Shield, Key, Lock, Fingerprint, Award,
  CheckSquare, Square, ChevronRight, Info,
  Save, History, ShieldAlert, ShieldPlus
} from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
}

export default function RbacManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/v1/rbac/roles'),
        fetch('/api/v1/rbac/permissions')
      ]);
      const rolesJson = await rolesRes.json();
      const permsJson = await permsRes.json();
      setRoles(rolesJson.data || []);
      setPermissions(permsJson.data || []);
    } catch (e) {
      toast.error('Failed to synchronize RBAC topology');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                 Governance Protocol Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: RBAC-Orchestrator</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Authority Topology</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Orchestrate Granular Permissions, Custom Roles & Access Persistence</p>
        </div>
        <button className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 flex items-center gap-2 group">
           <Plus className="w-4 h-4" /> Provision Custom Role
        </button>
      </div>

      {/* RBAC Status Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Platform Roles', value: roles.length, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
           { label: 'Available Perms', value: permissions.length, icon: Key, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { label: 'System Lock', value: 'Active', icon: Lock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { label: 'Compliance Index', value: '100%', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
         ].map((stat) => (
           <div key={stat.label} className="p-6 rounded-[32px] bg-white/[0.01] border border-white/[0.05] flex items-center gap-6 group hover:bg-white/[0.02] transition-all relative overflow-hidden">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Roles Topology */}
         <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] px-2 mb-4 flex items-center gap-2 leading-none">
               <Layers className="w-4 h-4 opacity-40 shrink-0" /> Role Lattices
            </h3>
            <div className="space-y-4">
               {roles.map((role) => (
                  <div 
                     key={role.id} 
                     onClick={() => setSelectedRole(role)}
                     className={`p-6 rounded-[32px] border transition-all cursor-pointer group relative overflow-hidden ${selectedRole?.id === role.id ? 'bg-purple-600 border-purple-500 shadow-2xl shadow-purple-900/20' : 'bg-white/[0.01] border-white/5 hover:border-purple-500/30'}`}
                  >
                     {role.isSystem && selectedRole?.id !== role.id && (
                        <span className="absolute top-4 right-4 text-[8px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                           IMMUTABLE
                        </span>
                     )}
                     <div className="flex items-center gap-4 relative">
                        <div className={`p-3 rounded-2xl ${selectedRole?.id === role.id ? 'bg-white/20' : 'bg-white/[0.03] text-purple-400'} group-hover:scale-110 transition-transform`}>
                           <Shield className="w-5 h-5" />
                        </div>
                        <div>
                           <h4 className={`text-sm font-black uppercase tracking-tight ${selectedRole?.id === role.id ? 'text-white' : 'text-gray-200'}`}>{role.name}</h4>
                           <p className={`text-[10px] truncate max-w-[150px] font-medium leading-none mt-1.5 ${selectedRole?.id === role.id ? 'text-white/60' : 'text-gray-600'}`}>{role.description}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Permission Forensics */}
         <div className="lg:col-span-2 p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />
            <div className="flex justify-between items-center mb-10 relative">
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Permission Matrix</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2">Active Role: <span className="text-purple-400">{selectedRole?.name || 'Inspect Role to View Permissions'}</span></p>
               </div>
               <div className="flex gap-4">
                  <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500">
                     <Search className="w-5 h-5" />
                  </div>
                  <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 group">
                     <Save className="w-4 h-4 group-hover:scale-110 transition-transform" /> Save Assignments
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
               {permissions.length > 0 ? (
                  Array.from(new Set(permissions.map(p => p.module))).map(module => (
                    <div key={module} className="space-y-6">
                       <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 leading-none">
                          <Activity className="w-4 h-4 opacity-40 shrink-0" /> {module} Intel
                       </h4>
                       <div className="space-y-4 pt-2">
                          {permissions.filter(p => p.module === module).map(p => (
                             <div key={p.id} className="flex items-center justify-between group/item cursor-pointer">
                                <div className="space-y-1">
                                   <p className="text-xs font-black text-white uppercase tracking-tight group-hover/item:text-purple-400 transition-colors">{p.name}</p>
                                   <p className="text-[9px] text-gray-700 font-mono italic">{p.code}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${selectedRole?.permissions.includes(p.code) ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' : 'bg-white/[0.02] border-white/10 text-gray-800 hover:border-purple-500/40'}`}>
                                   {selectedRole?.permissions.includes(p.code) ? <CheckSquare className="w-5 h-5" /> : <Plus className="w-5 h-5 opacity-20 group-hover/item:opacity-40" />}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  ))
               ) : (
                  <div className="col-span-2 py-32 text-center space-y-6">
                     <Fingerprint className="w-20 h-20 text-gray-800 mx-auto opacity-20" />
                     <p className="text-sm font-black text-gray-600 uppercase tracking-widest leading-none">Permission Lattices Initializing...</p>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Persistence Policy artifact */}
      <div className="p-12 rounded-[60px] bg-purple-600 text-white flex flex-col lg:flex-row items-center justify-between gap-10 group shadow-2xl shadow-purple-900/20 relative overflow-hidden">
         <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
         <div className="flex items-center gap-10 relative">
            <div className="p-8 rounded-[32px] bg-white/20 backdrop-blur-md border border-white/20">
               <History className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-3">
               <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Structural RBAC Audit</h3>
               <p className="text-sm text-white/70 font-bold uppercase tracking-tight max-w-xl">
                  Analyze historical RBAC dispatches and authority assignments. Inspect every structural policy-divergence to ensure absolute governance across the workspace node.
               </p>
            </div>
         </div>
         <button className="px-10 py-5 bg-[#0b0f19] text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/40 shrink-0 relative">
            Governance Archives
         </button>
      </div>

    </div>
  );
}
