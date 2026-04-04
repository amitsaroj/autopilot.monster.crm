"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Loader2, UserPlus, Shield, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";
import Link from "next/link";

interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  status: string;
  lastLogin: string | null;
}

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to sync identity matrix");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/users/${id}`, { status: newStatus });
      toast.success(`Identity status updated to ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to alter identity state");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">Tenant Identities</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Manage access privileges and user nodes</p>
        </div>
        <Link 
          href="/settings/users/invite"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20"
        >
          <UserPlus className="w-4 h-4" /> Provision Identity
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col justify-center relative overflow-hidden group">
           <Users className="w-20 h-20 absolute -right-4 -bottom-4 text-indigo-500/20 group-hover:scale-110 transition-transform" />
           <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Active Nodes</p>
           <p className="text-3xl font-black text-white">{users.filter(u => u.status === 'ACTIVE').length}</p>
        </div>
        <div className="p-6 rounded-3xl bg-[#0b0f19] border border-white/5 flex flex-col justify-center relative overflow-hidden group">
           <Shield className="w-20 h-20 absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" />
           <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Admins</p>
           <p className="text-3xl font-black text-white">{users.filter(u => u.roles.includes('ADMIN') || u.roles.includes('TENANT_ADMIN')).length}</p>
        </div>
        <div className="p-6 rounded-3xl bg-[#0b0f19] border border-white/5 flex flex-col justify-center relative overflow-hidden group">
           <Mail className="w-20 h-20 absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" />
           <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Pending Sync</p>
           <p className="text-3xl font-black text-white">{users.filter(u => u.status === 'PENDING').length}</p>
        </div>
      </div>

      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Identity Details</th>
                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Privilege Matrix</th>
                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Status</th>
                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Last Pulse</th>
                <th className="p-6 text-right text-[10px] font-black tracking-widest uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-lg uppercase shadow-inner">
                        {member.firstName?.[0] || member.email[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{member.firstName} {member.lastName}</p>
                        <p className="text-[10px] font-bold text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      {member.roles.map(role => (
                        <span key={role} className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-6">
                    {member.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : member.status === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                        <XCircle className="w-3 h-3" /> Disabled
                      </span>
                    )}
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never Segmented'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => handleDeactivate(member.id, member.status)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No subordinate identities provisioned</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
