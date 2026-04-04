"use client";

import { useState } from 'react';
import { Lock, Search, CheckCircle2, XCircle, Filter } from 'lucide-react';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
  roles: string[];
}

const mockPermissions: Permission[] = [
  { id: '1', resource: 'crm.contacts', action: 'read', description: 'View contact records', roles: ['TENANT_ADMIN', 'SALES_REP', 'SUPPORT_AGENT', 'ANALYST', 'VIEWER'] },
  { id: '2', resource: 'crm.contacts', action: 'write', description: 'Create and edit contacts', roles: ['TENANT_ADMIN', 'SALES_REP'] },
  { id: '3', resource: 'crm.contacts', action: 'delete', description: 'Delete contact records', roles: ['TENANT_ADMIN'] },
  { id: '4', resource: 'crm.deals', action: 'read', description: 'View deal records', roles: ['TENANT_ADMIN', 'SALES_REP', 'ANALYST'] },
  { id: '5', resource: 'crm.deals', action: 'write', description: 'Create and edit deals', roles: ['TENANT_ADMIN', 'SALES_REP'] },
  { id: '6', resource: 'billing', action: 'read', description: 'View billing information', roles: ['TENANT_ADMIN'] },
  { id: '7', resource: 'billing', action: 'write', description: 'Manage subscriptions and payments', roles: ['TENANT_ADMIN'] },
  { id: '8', resource: 'settings', action: 'read', description: 'View workspace settings', roles: ['TENANT_ADMIN'] },
  { id: '9', resource: 'settings', action: 'write', description: 'Modify workspace settings', roles: ['TENANT_ADMIN'] },
  { id: '10', resource: 'users', action: 'read', description: 'View team members', roles: ['TENANT_ADMIN', 'ANALYST'] },
  { id: '11', resource: 'users', action: 'write', description: 'Invite and manage users', roles: ['TENANT_ADMIN'] },
  { id: '12', resource: 'analytics', action: 'read', description: 'View reports & analytics', roles: ['TENANT_ADMIN', 'SALES_REP', 'ANALYST'] },
  { id: '13', resource: 'inbox', action: 'read', description: 'View conversation inbox', roles: ['TENANT_ADMIN', 'SUPPORT_AGENT'] },
  { id: '14', resource: 'inbox', action: 'write', description: 'Reply to conversations', roles: ['TENANT_ADMIN', 'SUPPORT_AGENT'] },
  { id: '15', resource: 'ai', action: 'read', description: 'View AI insights and agents', roles: ['TENANT_ADMIN', 'ANALYST'] },
];

const ALL_ROLES = ['TENANT_ADMIN', 'SALES_REP', 'SUPPORT_AGENT', 'ANALYST', 'VIEWER'];
const ROLE_COLORS: Record<string, string> = {
  TENANT_ADMIN: 'text-indigo-400',
  SALES_REP: 'text-blue-400',
  SUPPORT_AGENT: 'text-emerald-400',
  ANALYST: 'text-amber-400',
  VIEWER: 'text-gray-400',
};

export default function AdminRBACPermissionsPage() {
  const [search, setSearch] = useState('');
  const resources = [...new Set(mockPermissions.map(p => p.resource))];

  const filtered = mockPermissions.filter(p =>
    p.resource.toLowerCase().includes(search.toLowerCase()) ||
    p.action.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Permissions Matrix</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Granular Role Permission Control</p>
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search by resource or action..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest min-w-[200px]">Resource · Action</th>
              <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest min-w-[200px]">Description</th>
              {ALL_ROLES.map(r => (
                <th key={r} className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center min-w-[110px] ${ROLE_COLORS[r]}`}>{r.replace('_', ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(perm => (
              <tr key={perm.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <span className="text-xs font-mono text-indigo-300">{perm.resource}<span className="text-gray-600">.</span><span className="text-emerald-300">{perm.action}</span></span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">{perm.description}</td>
                {ALL_ROLES.map(role => (
                  <td key={role} className="px-4 py-3 text-center">
                    {perm.roles.includes(role)
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      : <XCircle className="w-4 h-4 text-gray-700 mx-auto" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
