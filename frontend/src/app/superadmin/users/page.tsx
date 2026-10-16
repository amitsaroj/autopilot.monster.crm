'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import {
  Users,
  Search,
  Filter,
  Mail,
  Shield,
  MapPin,
  Calendar,
  MoreVertical,
  UserX,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  ArrowRight,
  Fingerprint,
  Lock,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  provider: 'local' | 'google' | 'facebook' | 'github' | 'apple';
  tenantId: string;
  tenant?: { name: string };
  createdAt: string;
  isMfaEnabled: boolean;
}

export default function GlobalUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?search=${query}`);
      const json = res.data;
      if (json.data) setUsers(json.data);
    } catch (e) {
      toast.error('Failed to sync global user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const getStatusBadge = (status: string) => {
    const colors: any = {
      active: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      inactive: 'bg-gray-500/10 text-muted-foreground border-gray-500/20',
      suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
      pending_verification:
        'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${colors[status]}`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Identity Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Platform Personas Across All Clusters
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-card border border-border hover:bg-white/[0.1] text-foreground rounded-xl text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2">
            <Mail className="w-4 h-4" /> Broadcast Invite
          </button>
          <button className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-blue-500/30 transition-all">
        <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-blue-400" />
        <input
          type="text"
          placeholder="Search by identity email, name, or system UID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-gray-600 font-medium"
        />
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {/* User Table */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Identity Profile
                </th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status / Security
                </th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Workspace Context
                </th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Registered
                </th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shadow-lg">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2 items-start">
                      {getStatusBadge(user.status)}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded bg-black/40 border border-border text-xs font-bold ${user.provider === 'local' ? 'text-muted-foreground' : 'text-blue-700 dark:text-blue-400'}`}
                        >
                          {user.provider.toUpperCase()}
                        </span>
                        {user.isMfaEnabled && (
                          <Lock className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5" /> {user.tenant?.name || 'Platform Admin'}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      UID: {user.id.substring(0, 8)}...
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />{' '}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-blue-500/20 transition-all">
                        <Key className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-red-400 hover:bg-red-500/20 transition-all">
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Fingerprint className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">
                        No identities discovered matching your search
                      </p>
                      <button
                        onClick={() => setSearch('')}
                        className="text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide hover:underline"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Observability CTA */}
      <div className="p-10 rounded-xl bg-blue-500/[0.02] border border-border relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Advanced Persona Oversight</h3>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Monitor active platform sessions, reset multi-factor authentication secrets, and
              perform global role-mapping overrides for emergency infrastructure access.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 rounded-xl bg-card hover:bg-white/[0.1] border border-border text-foreground text-xs font-semibold uppercase tracking-wide transition-all">
              Security Logs
            </button>
            <button className="px-6 py-3 rounded-xl bg-card hover:bg-white/[0.1] border border-border text-foreground text-xs font-semibold uppercase tracking-wide transition-all">
              Global Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
