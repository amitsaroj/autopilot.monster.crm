"use client";

import {
  ShieldCheck, Users, Lock, Eye, ArrowRight,
  CheckCircle2, AlertTriangle, Settings
} from 'lucide-react';
import Link from 'next/link';

const RBAC_MODULES = [
  { label: 'Users & Access', href: '/admin/rbac/users', icon: Users, desc: 'Manage user accounts and role assignments', color: 'text-blue-400', bg: 'bg-blue-500/10', stat: '24 Users' },
  { label: 'Roles', href: '/admin/rbac/roles', icon: ShieldCheck, desc: 'Define and configure access roles', color: 'text-indigo-400', bg: 'bg-indigo-500/10', stat: '6 Roles' },
  { label: 'Permissions', href: '/admin/rbac/permissions', icon: Lock, desc: 'Granular permission control per resource', color: 'text-purple-400', bg: 'bg-purple-500/10', stat: '84 Perms' },
  { label: 'Access Audits', href: '/admin/rbac/audits', icon: Eye, desc: 'Audit trail for all access events', color: 'text-amber-400', bg: 'bg-amber-500/10', stat: '1,204 Events' },
];

export default function AdminRBACPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" /> Zero Trust Access
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">RBAC Control</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Role-Based Access Control Center</p>
        </div>
        <Link href="/admin/rbac/roles"
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Settings className="w-4 h-4" /> Manage Roles
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '24', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Users },
          { label: 'Active Roles', value: '6', color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: ShieldCheck },
          { label: 'Permissions', value: '84', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Lock },
          { label: 'RBAC Violations', value: '0', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {RBAC_MODULES.map(mod => (
          <Link key={mod.href} href={mod.href}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform`}>
                <mod.icon className={`w-6 h-6 ${mod.color}`} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{mod.stat}</span>
            </div>
            <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors mb-1">{mod.label}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{mod.desc}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-600 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-black text-white">RBAC Compliance Status: Healthy</p>
            <p className="text-xs text-gray-400 mt-1">All users have valid role assignments. No orphaned permissions detected. Last audit: 2 hours ago.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
