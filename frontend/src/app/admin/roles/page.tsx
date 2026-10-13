'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  Settings,
  Users,
  CheckCircle2,
  ChevronRight,
  Search,
  Loader2,
  Info,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: any[];
  _count?: { users: number };
}

export default function TenantRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rbac/roles');
      const json = res.data;
      if (json.data) setRoles(json.data);
    } catch (e) {
      toast.error('Failed to sync security definitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const getRoleIcon = (name: string) => {
    if (['ADMIN', 'OWNER', 'SUPER_ADMIN'].includes(name.toUpperCase())) return ShieldAlert;
    if (['MANAGER', 'LEAD'].includes(name.toUpperCase())) return ShieldCheck;
    return Shield;
  };

  if (loading && !roles.length) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Security Orchestration</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            RBAC Personas & Permission Mapping ({roles.length})
          </p>
        </div>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Provision Role
        </button>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const Icon = getRoleIcon(role.name);
          return (
            <div
              key={role.id}
              className="group p-8 rounded-3xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all relative overflow-hidden flex flex-col justify-between"
            >
              {/* Background Glow */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`p-4 rounded-2xl bg-card border border-border group-hover:bg-blue-500 group-hover:text-white transition-all`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white transition-all">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                    {role.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono tracking-tighter uppercase">
                    ID: {role.id.substring(0, 12)}...
                  </p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  {role.description ||
                    'Standard workspace persona with inherited permissions. Custom overrides may apply.'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-black/40 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-tight">
                      Assigned Members
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{role._count?.users || 0}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                    <span>Permission Schema</span>
                    <span className="text-blue-700 dark:text-blue-400">
                      {role.permissions?.length || 0} Unified Rules
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 line-clamp-2 overflow-hidden max-h-[60px]">
                    {role.permissions?.slice(0, 5).map((p: any) => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded-md bg-card border border-border text-xs font-bold text-muted-foreground"
                      >
                        {p.name.split(':')[1] || p.name}
                      </span>
                    ))}
                    {(role.permissions?.length || 0) > 5 && (
                      <span className="px-2 py-0.5 rounded-md bg-card border border-border text-xs font-bold text-muted-foreground">
                        +{(role.permissions?.length || 0) - 5} More
                      </span>
                    )}
                  </div>
                </div>

                <button className="w-full py-4 px-6 rounded-2xl bg-card hover:bg-white/[0.08] border border-border text-xs font-semibold text-foreground uppercase tracking-wide transition-all flex items-center justify-center gap-2">
                  Refine Permissions <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Global Blueprint Card */}
        <div className="p-8 rounded-3xl border border-dashed border-border bg-blue-500/[0.01] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-gray-700">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Advanced Policy Engine</h3>
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
              Create roles from platform blueprints or clone existing workspace security profiles.
            </p>
          </div>
          <button className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2 hover:underline transition-all">
            Launch Blueprint <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Advisory */}
      <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-5">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-tight">
            Critical Deployment Rule: RBAC Integrity
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Platform-level roles (e.g., SUPER_ADMIN) cannot be modified or deleted via the workspace
            UI. Permissions added to a tenant role will only grant access to resources scoped to
            this workspace. Global system access requires platform-level privilege mapping.
          </p>
        </div>
      </div>
    </div>
  );
}
