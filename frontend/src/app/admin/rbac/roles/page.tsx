'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Users,
  Lock,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { rbacService, type Role } from '@/services/rbac.service';

export default function AdminRBACRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await rbacService.getRoles();
        setRoles(res.data.data);
      } catch {
        toast.error('Failed to load roles');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Roles</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            RBAC Role Definitions
          </p>
        </div>
        <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-2xl bg-card border border-border hover:border-blue-500/20 transition-all overflow-hidden"
          >
            <div
              className="flex items-center gap-4 p-5 cursor-pointer"
              onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
            >
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-foreground font-mono">{role.name}</h3>
                  {role.isSystem && (
                    <span className="text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-card text-muted-foreground border border-border">
                      SYSTEM
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {role.description ?? 'No description'}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5" /> {role.permissions?.length ?? 0} perm
                  {(role.permissions?.length ?? 0) !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1">
                  {!role.isSystem && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-white transition-all">
                    {expandedRole === role.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {expandedRole === role.id && (
              <div className="px-5 pb-5 border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Permissions
                </p>
                <div className="flex flex-wrap gap-2">
                  {(role.permissions ?? []).map((p) => (
                    <span
                      key={p.id}
                      className="px-2 py-1 rounded-lg bg-card border border-border text-xs font-mono text-muted-foreground"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
