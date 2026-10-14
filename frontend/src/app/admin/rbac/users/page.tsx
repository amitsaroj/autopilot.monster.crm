'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Edit2,
  UserPlus,
  MoreVertical,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { userService, type User } from '@/services/user.service';

const ROLE_STYLES: Record<string, string> = {
  TENANT_ADMIN: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  SALES_REP: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  SUPPORT_AGENT: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  ANALYST: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  VIEWER: 'bg-gray-500/10 text-muted-foreground border-gray-500/20',
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminRBACUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await userService.getUsers();
        const payload = res.data?.data ?? res.data;
        setUsers(Array.isArray(payload) ? payload : (payload?.data ?? []));
      } catch {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = users.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Users & Access</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Role Assignment & User Access Management
          </p>
        </div>
        <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Users',
            value: users.length,
            icon: Users,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Active',
            value: users.length,
            icon: CheckCircle2,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Roles',
            value: users.every((u) => Array.isArray(u.roles))
              ? [...new Set(users.flatMap((u) => u.roles))].length
              : '—',
            icon: ShieldCheck,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Total',
            value: users.length,
            icon: AlertTriangle,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                {s.label}
              </p>
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 focus-within:border-blue-500/30 transition-all">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-600"
        />
      </div>

      <div className="rounded-3xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-card">
              {['User', 'Role', 'Status', 'Last Login', 'MFA', ''].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map((user) => (
              <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-sm border border-blue-500/20">
                      {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${ROLE_STYLES[user.roles?.[0] ?? ''] || 'bg-gray-500/10 text-muted-foreground border-gray-500/20'}`}
                  >
                    {(user.roles?.[0] ?? 'Not provided').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                    ACTIVE
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Ban className="w-3.5 h-3.5" />
                    </button>
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
