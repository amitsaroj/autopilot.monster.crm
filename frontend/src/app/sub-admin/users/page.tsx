'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Trash2, Loader2, Mail, X } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminUsersService } from '@/services/sub-admin-users.service';
import { subAdminRolesService } from '@/services/sub-admin-roles.service';

interface TenantRole {
  id: string;
  name: string;
}

interface TenantUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  isMfaEnabled?: boolean;
  lastLoginAt?: string | null;
}

function unwrap<T>(response: any, fallback: T): T {
  const payload = response?.data ?? response;
  return (Array.isArray(payload) ? payload : (payload?.data ?? fallback)) as T;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function SubAdminUsersPage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [roles, setRoles] = useState<TenantRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', roleId: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        subAdminUsersService.getUsers(),
        subAdminRolesService.getRoles(),
      ]);
      setUsers(unwrap<TenantUser[]>(usersRes, []));
      const roleList = unwrap<TenantRole[]>(rolesRes, []);
      setRoles(roleList);
      setInviteForm((prev) => ({ ...prev, roleId: prev.roleId || roleList[0]?.id || '' }));
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email) {
      toast.error('Email is required');
      return;
    }
    if (!inviteForm.roleId) {
      toast.error('Select a role for this invite');
      return;
    }
    setSubmitting(true);
    try {
      await subAdminUsersService.inviteUser(inviteForm);
      toast.success('Invitation sent');
      setShowInvite(false);
      setInviteForm((prev) => ({ email: '', roleId: prev.roleId }));
      void load();
    } catch {
      toast.error('Failed to invite user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (user: TenantUser) => {
    if (!window.confirm(`Remove ${user.email} from this workspace?`)) return;
    try {
      await subAdminUsersService.removeUser(user.id);
      toast.success('User removed');
      void load();
    } catch {
      toast.error('Failed to remove user');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(search.toLowerCase()),
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
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Workspace Membership
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length },
          {
            label: 'Active',
            value: users.filter((u) => u.status?.toLowerCase() === 'active').length,
          },
          { label: 'MFA Enabled', value: users.filter((u) => u.isMfaEnabled).length },
          {
            label: 'Pending Invites',
            value: users.filter((u) => u.status?.toUpperCase() === 'PENDING').length,
          },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 focus-within:border-blue-500/30 transition-all">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-600"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 rounded-2xl bg-card border border-border text-center text-muted-foreground text-sm">
          No users found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="p-6 rounded-2xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500 transition-all">
                    <Users className="w-5 h-5 text-blue-700 dark:text-blue-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {user.firstName || user.lastName
                        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                        : user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase ${
                    STATUS_STYLES[user.status] ??
                    'bg-gray-500/10 text-muted-foreground border-gray-500/20'
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  {user.lastLoginAt
                    ? `Last login ${new Date(user.lastLoginAt).toLocaleDateString()}`
                    : 'Never logged in'}
                </p>
                <button
                  onClick={() => handleRemove(user)}
                  className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/20 transition-all"
                  title="Remove user"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Invite User</h2>
              <button
                onClick={() => setShowInvite(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.05] text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Email
                </label>
                <div className="mt-1.5 flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground"
                    placeholder="teammate@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Role
                </label>
                <select
                  required
                  value={inviteForm.roleId}
                  onChange={(e) => setInviteForm({ ...inviteForm, roleId: e.target.value })}
                  className="mt-1.5 w-full p-3 rounded-xl bg-card border border-border outline-none text-sm text-foreground"
                >
                  <option value="" disabled>
                    Select a role...
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id} className="bg-card">
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Send Invite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
