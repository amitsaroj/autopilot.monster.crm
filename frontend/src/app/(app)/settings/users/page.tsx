'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  Loader2,
  UserPlus,
  Shield,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import Link from 'next/link';

interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  status: string;
  lastLoginAt: string | null;
}

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('Unable to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/users/${id}`, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error('Unable to update user status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground uppercase">
            Team members
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mt-1">
            Manage access privileges and user nodes
          </p>
        </div>
        <Link
          href="/settings/users/invite"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20"
        >
          <UserPlus className="w-4 h-4" /> Invite team member
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-center relative overflow-hidden group">
          <Users className="w-20 h-20 absolute -right-4 -bottom-4 text-blue-500/20 group-hover:scale-110 transition-transform" />
          <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">
            Active Nodes
          </p>
          <p className="text-3xl font-semibold text-foreground">
            {users.filter((u) => u.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-center relative overflow-hidden group">
          <Shield className="w-20 h-20 absolute -right-4 -bottom-4 text-foreground/5 group-hover:scale-110 transition-transform" />
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Admins
          </p>
          <p className="text-3xl font-semibold text-foreground">
            {users.every((u) => Array.isArray(u.roles))
              ? users.filter((u) => u.roles?.includes('ADMIN') || u.roles?.includes('TENANT_ADMIN'))
                  .length
              : '—'}
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-center relative overflow-hidden group">
          <Mail className="w-20 h-20 absolute -right-4 -bottom-4 text-foreground/5 group-hover:scale-110 transition-transform" />
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Pending Sync
          </p>
          <p className="text-3xl font-semibold text-foreground">
            {users.filter((u) => u.status === 'PENDING').length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="p-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Account details
                </th>
                <th className="p-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Workspace role
                </th>
                <th className="p-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Status
                </th>
                <th className="p-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Last Pulse
                </th>
                <th className="p-6 text-right text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-lg uppercase shadow-inner">
                        {member.firstName?.[0] || member.email[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground uppercase tracking-tight">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      {member.roles?.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 rounded-md bg-card border border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                        >
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                      {!member.roles && (
                        <span className="text-sm text-muted-foreground">Not provided</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    {member.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : member.status === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wide border border-amber-500/20">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-wide border border-red-500/20">
                        <XCircle className="w-3 h-3" /> Disabled
                      </span>
                    )}
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {member.lastLoginAt
                        ? new Date(member.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => handleDeactivate(member.id, member.status)}
                      aria-label={`${member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} ${member.email}`}
                      className="p-2 text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
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
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                No subordinate identities provisioned
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
