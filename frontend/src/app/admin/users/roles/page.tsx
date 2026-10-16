'use client';

import { useState, useEffect } from 'react';
import { parseApiData } from '@/lib/api/parse-response';
import { rbacService, type Role, type Permission } from '@/services/rbac.service';
import api from '@/lib/api/client';
import {
  Plus,
  Search,
  Filter,
  Layers,
  Settings,
  Trash2,
  Globe,
  ShieldCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Activity,
  Server,
  Cpu,
  Layout,
  ExternalLink,
  Package,
  Zap,
  Download,
  Star,
  Users,
  Link as LinkIcon,
  Shield,
  Key,
  Lock,
  Fingerprint,
  Award,
  CheckSquare,
  Square,
  ChevronRight,
  Info,
  Save,
  History,
  ShieldAlert,
  ShieldPlus,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RbacManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);

  const selectRole = async (role: Role) => {
    setSelectedRole(null);
    try {
      const response = await rbacService.getRole(role.id);
      setSelectedRole(parseApiData<Role>(response));
    } catch {
      toast.error('Unable to load role permissions');
    }
  };

  const togglePermission = (permission: Permission) => {
    setSelectedRole((role) => {
      if (!role || role.isSystem) return role;
      const current = role.permissions ?? [];
      return {
        ...role,
        permissions: current.some((item) => item.id === permission.id)
          ? current.filter((item) => item.id !== permission.id)
          : [...current, permission],
      };
    });
  };

  const savePermissions = async () => {
    if (!selectedRole || selectedRole.isSystem) return;
    setSaving(true);
    try {
      await rbacService.updateRole(selectedRole.id, {
        permissionIds: selectedRole.permissions.map((permission) => permission.id),
      });
      toast.success('Role permissions saved');
    } catch {
      toast.error('Unable to save role permissions');
    } finally {
      setSaving(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/rbac/roles'),
        api.get('/rbac/permissions'),
      ]);
      setRoles(parseApiData<Role[]>(rolesRes) ?? []);
      setPermissions(parseApiData<Permission[]>(permsRes) ?? []);
    } catch (e) {
      toast.error('Failed to synchronize RBAC topology');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Governance Protocol Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: RBAC-Orchestrator
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Authority Topology
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Orchestrate Granular Permissions, Custom Roles & Access Persistence
          </p>
        </div>
        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group">
          <Plus className="w-4 h-4" /> Provision Custom Role
        </button>
      </div>

      {/* RBAC Status Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Platform Roles',
            value: roles.length,
            icon: Shield,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Available Perms',
            value: permissions.length,
            icon: Key,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'System Lock',
            value: 'Active',
            icon: Lock,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Compliance Index',
            value: '100%',
            icon: ShieldCheck,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl bg-card border border-border flex items-center gap-6 group hover:bg-white/[0.02] transition-all relative overflow-hidden"
          >
            <div
              className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5 leading-none">
                {stat.label}
              </p>
              <p className="text-xl font-semibold text-foreground uppercase tracking-tighter">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Roles Topology */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em] px-2 mb-4 flex items-center gap-2 leading-none">
            <Layers className="w-4 h-4 opacity-40 shrink-0" /> Role Lattices
          </h3>
          <div className="space-y-4">
            {roles.map((role) => (
              <button
                type="button"
                key={role.id}
                onClick={() => void selectRole(role)}
                className={`w-full text-left p-6 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${selectedRole?.id === role.id ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 shadow-2xl shadow-blue-900/20' : 'bg-card border-border hover:border-blue-500/30'}`}
              >
                {role.isSystem && selectedRole?.id !== role.id && (
                  <span className="absolute top-4 right-4 text-[8px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    IMMUTABLE
                  </span>
                )}
                <div className="flex items-center gap-4 relative">
                  <div
                    className={`p-3 rounded-2xl ${selectedRole?.id === role.id ? 'bg-white/20' : 'bg-card text-blue-700 dark:text-blue-400'} group-hover:scale-110 transition-transform`}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-semibold uppercase tracking-tight ${selectedRole?.id === role.id ? 'text-foreground' : 'text-foreground'}`}
                    >
                      {role.name}
                    </h4>
                    <p
                      className={`text-xs truncate max-w-[150px] font-medium leading-none mt-1.5 ${selectedRole?.id === role.id ? 'text-foreground/60' : 'text-muted-foreground'}`}
                    >
                      {role.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permission Forensics */}
        <div className="lg:col-span-2 p-10 rounded-[60px] bg-card border border-border relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="flex justify-between items-center mb-10 relative">
            <div>
              <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter leading-none">
                Permission Matrix
              </h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-2">
                Active Role:{' '}
                <span className="text-blue-700 dark:text-blue-400">
                  {selectedRole?.name || 'Inspect Role to View Permissions'}
                </span>
              </p>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-card border border-border rounded-xl text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => void savePermissions()}
                disabled={!selectedRole || selectedRole.isSystem || saving}
                className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-semibold uppercase tracking-wide shadow-xl flex items-center gap-2 group disabled:opacity-50"
              >
                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" /> Save
                Assignments
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
            {permissions.length > 0 ? (
              Array.from(new Set(permissions.map((p) => p.resource))).map((module) => (
                <div key={module} className="space-y-6">
                  <h4 className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2 leading-none">
                    <Activity className="w-4 h-4 opacity-40 shrink-0" /> {module} Intel
                  </h4>
                  <div className="space-y-4 pt-2">
                    {permissions
                      .filter((p) => p.resource === module)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between group/item cursor-pointer"
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-tight group-hover/item:text-blue-400 transition-colors">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono italic">
                              {p.action}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={`Toggle ${p.name}`}
                            aria-pressed={
                              selectedRole?.permissions?.some(
                                (permission) => permission.id === p.id,
                              ) ?? false
                            }
                            disabled={!selectedRole || selectedRole.isSystem || saving}
                            onClick={() => togglePermission(p)}
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${selectedRole?.permissions?.some((permission) => permission.id === p.id) ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-card border-border text-muted-foreground hover:border-blue-500/40'}`}
                          >
                            {selectedRole?.permissions?.some(
                              (permission) => permission.id === p.id,
                            ) ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5 opacity-20 group-hover/item:opacity-40" />
                            )}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-32 text-center space-y-6">
                <Fingerprint className="w-20 h-20 text-gray-800 mx-auto opacity-20" />
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide leading-none">
                  Permission Lattices Initializing...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persistence Policy artifact */}
      <div className="p-12 rounded-[60px] bg-blue-600 text-white flex flex-col lg:flex-row items-center justify-between gap-10 group shadow-2xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-card rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center gap-10 relative">
          <div className="p-8 rounded-xl bg-white/20 backdrop-blur-md border border-border">
            <History className="w-12 h-12 text-foreground" />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-semibold uppercase tracking-tighter leading-none">
              Structural RBAC Audit
            </h3>
            <p className="text-sm text-foreground/70 font-bold uppercase tracking-tight max-w-xl">
              Analyze historical RBAC dispatches and authority assignments. Inspect every structural
              policy-divergence to ensure absolute governance across the workspace node.
            </p>
          </div>
        </div>
        <button className="px-10 py-5 bg-card text-foreground rounded-3xl text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/40 shrink-0 relative">
          Governance Archives
        </button>
      </div>
    </div>
  );
}
