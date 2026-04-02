"use client";

import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Mail, 
  MoreVertical, UserCheck, Shield, Key,
  CheckCircle2, Clock, Trash2, Loader2,
  ArrowRight, Fingerprint, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  roles: any[];
  createdAt: string;
}

export default function TenantUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/sub-admin/users');
      const json = await res.json();
      if (json.data) setUsers(json.data);
    } catch (e) {
      toast.error('Failed to retrieve team directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async () => {
    toast.info('Invitation workflow launching...');
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
      pending_verification: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${colors[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Team Management</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Workspace Members ({users.length})</p>
        </div>
        <button 
          onClick={handleInvite}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
           <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      {/* Global Persistence Control */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all">
         <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
         <input 
            type="text" 
            placeholder="Filter by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
         />
         {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
      </div>

      {/* Data Grid */}
      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                     <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Member Portrait</th>
                     <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Status</th>
                     <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">RBAC Context</th>
                     <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Joined On</th>
                     <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.05]">
                  {users.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center text-white text-xs font-black shadow-lg">
                                {user.firstName[0]}{user.lastName[0]}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{user.firstName} {user.lastName}</p>
                                <p className="text-[10px] text-gray-600 font-mono mt-0.5">{user.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          {getStatusBadge(user.status)}
                       </td>
                       <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2">
                             {user.roles?.map((role: any) => (
                               <span key={role.id} className="px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                                  {role.name}
                               </span>
                             ))}
                             {!user.roles?.length && <span className="text-xs text-gray-700 italic">No Roles</span>}
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                             <Clock className="w-3.5 h-3.5" /> {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                       </td>
                       <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-indigo-500/20 transition-all">
                                <Key className="w-4 h-4" />
                             </button>
                             <button className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition-all">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {users.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                         <div className="flex flex-col items-center gap-4 text-gray-700">
                            <Fingerprint className="w-12 h-12 opacity-30" />
                            <p className="text-sm font-medium">Your workspace identity vault is empty</p>
                            <button onClick={handleInvite} className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:underline">Invite First Member</button>
                         </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Advanced Orchestration Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] space-y-3">
            <Shield className="w-6 h-6 text-indigo-500" />
            <h4 className="text-sm font-black text-white uppercase tracking-tight font-sans">Role Mapping</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Define custom permission sets and assign them to specific team personas within this workspace cluster.</p>
         </div>
         <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] space-y-3">
            <Mail className="w-6 h-6 text-emerald-500" />
            <h4 className="text-sm font-black text-white uppercase tracking-tight font-sans">Invitation Logs</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Monitor pending member invitations, verify delivery status, and re-issue authentication tokens.</p>
         </div>
         <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] space-y-3">
            <Fingerprint className="w-6 h-6 text-amber-500" />
            <h4 className="text-sm font-black text-white uppercase tracking-tight font-sans">Access Secrets</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Review login frequencies, manage MFA device registration, and orchestrate emergency account lockdowns.</p>
         </div>
      </div>

    </div>
  );
}
