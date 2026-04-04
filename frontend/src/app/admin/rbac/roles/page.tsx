"use client";

import { useState } from 'react';
import {
  ShieldCheck, Plus, Edit2, Trash2, Users,
  Lock, CheckCircle2, Copy, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
  color: string;
}

const mockRoles: Role[] = [
  { id: '1', name: 'SUPER_ADMIN', description: 'Full platform control across all tenants', userCount: 1, permissions: ['*'], isSystem: true, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: '2', name: 'TENANT_ADMIN', description: 'Full workspace management for a single tenant', userCount: 3, permissions: ['users.*', 'crm.*', 'billing.read', 'settings.*'], isSystem: true, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: '3', name: 'SALES_REP', description: 'CRM access for daily sales operations', userCount: 12, permissions: ['crm.contacts.*', 'crm.deals.*', 'crm.leads.*'], isSystem: false, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: '4', name: 'SUPPORT_AGENT', description: 'Inbox and ticket management access', userCount: 5, permissions: ['inbox.*', 'crm.contacts.read', 'support.*'], isSystem: false, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: '5', name: 'ANALYST', description: 'Read-only analytics and reporting access', userCount: 2, permissions: ['analytics.read', 'crm.read', 'reports.read'], isSystem: false, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: '6', name: 'VIEWER', description: 'Read-only access to CRM data', userCount: 1, permissions: ['crm.read'], isSystem: false, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
];

export default function AdminRBACRolesPage() {
  const [roles] = useState<Role[]>(mockRoles);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Roles</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">RBAC Role Definitions</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      <div className="space-y-3">
        {roles.map(role => (
          <div key={role.id} className="rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all overflow-hidden">
            <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}>
              <div className={`p-2.5 rounded-xl ${role.color.split(' ')[1]} border ${role.color.split(' ')[2]} shrink-0`}>
                <ShieldCheck className={`w-5 h-5 ${role.color.split(' ')[0]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-black text-white font-mono">{role.name}</h3>
                  {role.isSystem && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.05] text-gray-500 border border-white/[0.08]">SYSTEM</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{role.description}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" /> {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock className="w-3.5 h-3.5" /> {role.permissions.length} perm{role.permissions.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1">
                  {!role.isSystem && (
                    <>
                      <button onClick={e => { e.stopPropagation(); }} className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); }} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button className="p-1.5 rounded-lg text-gray-600 hover:text-white transition-all">
                    {expandedRole === role.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            {expandedRole === role.id && (
              <div className="px-5 pb-5 border-t border-white/[0.05]">
                <div className="pt-4">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map(perm => (
                      <span key={perm} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-300">{perm}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
