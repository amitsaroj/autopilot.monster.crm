'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, Trash2, Loader2, Lock, X } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminRolesService } from '@/services/sub-admin-roles.service';

interface TenantRole {
  id: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
}

function unwrap<T>(response: any, fallback: T): T {
  const payload = response?.data ?? response;
  return (Array.isArray(payload) ? payload : (payload?.data ?? fallback)) as T;
}

export default function SubAdminRolesPage() {
  const [roles, setRoles] = useState<TenantRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subAdminRolesService.getRoles();
      setRoles(unwrap<TenantRole[]>(res, []));
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Role name is required');
      return;
    }
    setSubmitting(true);
    try {
      await subAdminRolesService.createRole(form);
      toast.success('Role created');
      setShowCreate(false);
      setForm({ name: '', description: '' });
      void load();
    } catch {
      toast.error('Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role: TenantRole) => {
    if (role.isSystem) return;
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      await subAdminRolesService.deleteRole(role.id);
      toast.success('Role deleted');
      void load();
    } catch {
      toast.error('Failed to delete role');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Roles</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Access Role Definitions
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Role
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Roles', value: roles.length },
          { label: 'System Roles', value: roles.filter((r) => r.isSystem).length },
          { label: 'Custom Roles', value: roles.filter((r) => !r.isSystem).length },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              {s.label}
            </p>
            <p className="text-2xl font-black text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {roles.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center text-gray-500 text-sm">
          No roles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((role) => (
            <div
              key={role.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500 transition-all">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-base font-black text-white">{role.name}</p>
                </div>
                {role.isSystem ? (
                  <span className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-500" title="System role — cannot be deleted">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <button
                    onClick={() => handleDelete(role)}
                    className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-500 hover:text-red-400 hover:border-red-500/20 transition-all"
                    title="Delete role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">{role.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0b0f1a] border border-white/[0.08] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white">New Role</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.05] text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 w-full p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] outline-none text-sm text-gray-200"
                  placeholder="e.g. SALES_LEAD"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1.5 w-full p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] outline-none text-sm text-gray-200"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Role
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
