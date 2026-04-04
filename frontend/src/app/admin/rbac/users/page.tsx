"use client";

import { useState } from 'react';
import {
  Users, Search, Shield, Mail, Clock,
  CheckCircle2, AlertTriangle, Ban, Edit2,
  UserPlus, MoreVertical, ShieldCheck
} from 'lucide-react';

interface RBACUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  lastLogin: string;
  mfaEnabled: boolean;
}

const mockUsers: RBACUser[] = [
  { id: '1', name: 'Admin User', email: 'admin@workspace.com', role: 'TENANT_ADMIN', status: 'ACTIVE', lastLogin: '2 hours ago', mfaEnabled: true },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@workspace.com', role: 'SALES_REP', status: 'ACTIVE', lastLogin: '30 min ago', mfaEnabled: false },
  { id: '3', name: 'Mike Chen', email: 'mike@workspace.com', role: 'SALES_REP', status: 'ACTIVE', lastLogin: '1 day ago', mfaEnabled: true },
  { id: '4', name: 'Priya Patel', email: 'priya@workspace.com', role: 'SUPPORT_AGENT', status: 'ACTIVE', lastLogin: '4 hours ago', mfaEnabled: false },
  { id: '5', name: 'Tom Williams', email: 'tom@workspace.com', role: 'ANALYST', status: 'PENDING', lastLogin: 'Never', mfaEnabled: false },
  { id: '6', name: 'Alex Rivera', email: 'alex@workspace.com', role: 'VIEWER', status: 'SUSPENDED', lastLogin: '2 weeks ago', mfaEnabled: false },
];

const ROLE_STYLES: Record<string, string> = {
  TENANT_ADMIN: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  SALES_REP: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SUPPORT_AGENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ANALYST: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  VIEWER: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminRBACUsersPage() {
  const [users] = useState<RBACUser[]>(mockUsers);
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Users & Access</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Role Assignment & User Access Management</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Active', value: users.filter(u => u.status === 'ACTIVE').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'MFA Enabled', value: users.filter(u => u.mfaEnabled).length, icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Pending', value: users.filter(u => u.status === 'PENDING').length, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search users by name, email, or role..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['User', 'Role', 'Status', 'Last Login', 'MFA', ''].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(user => (
              <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm border border-indigo-500/20">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${ROLE_STYLES[user.role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>{user.role.replace('_', ' ')}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[user.status]}`}>{user.status}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3 h-3" /> {user.lastLogin}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {user.mfaEnabled
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"><Ban className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
