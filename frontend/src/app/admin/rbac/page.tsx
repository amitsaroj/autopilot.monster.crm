'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  Lock,
  Eye,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';
import { rbacService, type Permission, type Role } from '@/services/rbac.service';
import { userService, type User } from '@/services/user.service';

interface AuditLog {
  id: string;
  action: string;
  resource?: string;
  metadata?: Record<string, unknown>;
}

interface RbacStats {
  users: number;
  roles: number;
  permissions: number;
  auditEvents: number;
  violations: number;
}

const MODULE_BASE = [
  {
    label: 'Users & Access',
    href: '/admin/rbac/users',
    icon: Users,
    desc: 'Manage user accounts and role assignments',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    key: 'users' as const,
  },
  {
    label: 'Roles',
    href: '/admin/rbac/roles',
    icon: ShieldCheck,
    desc: 'Define and configure access roles',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    key: 'roles' as const,
  },
  {
    label: 'Permissions',
    href: '/admin/rbac/permissions',
    icon: Lock,
    desc: 'Granular permission control per resource',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    key: 'permissions' as const,
  },
  {
    label: 'Access Audits',
    href: '/admin/rbac/audits',
    icon: Eye,
    desc: 'Audit trail for all access events',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    key: 'auditEvents' as const,
  },
];

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (
    value &&
    typeof value === 'object' &&
    'data' in value &&
    Array.isArray((value as { data: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }
  return [];
}

export default function AdminRBACPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RbacStats>({
    users: 0,
    roles: 0,
    permissions: 0,
    auditEvents: 0,
    violations: 0,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, rolesRes, permsRes, auditsRes] = await Promise.all([
          userService.getUsers(),
          rbacService.getRoles(),
          rbacService.getPermissions(),
          api.get('/logs/audit'),
        ]);

        const users = asArray<User>(parseApiData(usersRes) ?? usersRes.data);
        const roles = asArray<Role>(parseApiData(rolesRes) ?? rolesRes.data);
        const permissions = asArray<Permission>(parseApiData(permsRes) ?? permsRes.data);
        const audits = asArray<AuditLog>(parseApiData(auditsRes) ?? auditsRes.data);
        const violations = audits.filter((e) => {
          const outcome = String(e.metadata?.outcome ?? '').toUpperCase();
          const action = e.action.toLowerCase();
          return outcome === 'DENIED' || action.includes('denied') || action.includes('violation');
        }).length;

        setStats({
          users: users.length,
          roles: roles.length,
          permissions: permissions.length,
          auditEvents: audits.length,
          violations,
        });
      } catch {
        toast.error('Failed to load RBAC statistics');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const moduleStats: Record<(typeof MODULE_BASE)[number]['key'], string> = {
    users: `${stats.users} Users`,
    roles: `${stats.roles} Roles`,
    permissions: `${stats.permissions} Perms`,
    auditEvents: `${stats.auditEvents.toLocaleString()} Events`,
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

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
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Role-Based Access Control Center
          </p>
        </div>
        <Link
          href="/admin/rbac/roles"
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
          <Settings className="w-4 h-4" /> Manage Roles
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Users',
            value: String(stats.users),
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            icon: Users,
          },
          {
            label: 'Active Roles',
            value: String(stats.roles),
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            icon: ShieldCheck,
          },
          {
            label: 'Permissions',
            value: String(stats.permissions),
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            icon: Lock,
          },
          {
            label: 'RBAC Violations',
            value: String(stats.violations),
            color: stats.violations > 0 ? 'text-amber-400' : 'text-emerald-400',
            bg: stats.violations > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
            icon: stats.violations > 0 ? AlertTriangle : CheckCircle2,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MODULE_BASE.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-3 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform`}
              >
                <mod.icon className={`w-6 h-6 ${mod.color}`} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                {moduleStats[mod.key]}
              </span>
            </div>
            <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors mb-1">
              {mod.label}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{mod.desc}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-600 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div
        className={`p-6 rounded-2xl border ${stats.violations > 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}
      >
        <div className="flex items-start gap-4">
          {stats.violations > 0 ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          )}
          <div>
            <p className="text-sm font-black text-white">
              RBAC Compliance Status: {stats.violations > 0 ? 'Attention Required' : 'Healthy'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.users} users · {stats.roles} roles · {stats.permissions} permissions ·{' '}
              {stats.auditEvents} audit events
              {stats.violations > 0
                ? ` · ${stats.violations} denial/violation events detected`
                : ' · No denial events in the current audit window'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
