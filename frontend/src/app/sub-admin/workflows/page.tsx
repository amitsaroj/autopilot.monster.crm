'use client';

import { useEffect, useState } from 'react';
import { Zap, Plus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminWorkflowsService } from '@/services/sub-admin-workflows.service';

interface Workflow {
  id: string;
  name?: string;
  status?: string;
  [k: string]: unknown;
}

function unwrapList(response: any): Workflow[] {
  const payload = response?.data ?? response;
  const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
  return Array.isArray(list) ? list : [];
}

export default function SubAdminWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await subAdminWorkflowsService.getWorkflows();
      setWorkflows(unwrapList(res));
    } catch {
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Workflow name is required');
      return;
    }
    setSaving(true);
    try {
      await subAdminWorkflowsService.createWorkflow(form);
      toast.success('Workflow created');
      setForm({ name: '' });
      setShowForm(false);
      await load();
    } catch {
      toast.error('Failed to create workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (workflow: Workflow) => {
    if (!window.confirm(`Delete workflow "${workflow.name ?? workflow.id}"?`)) return;
    setDeletingId(workflow.id);
    try {
      await subAdminWorkflowsService.deleteWorkflow(workflow.id);
      toast.success('Workflow deleted');
      await load();
    } catch {
      toast.error('Failed to delete workflow');
    } finally {
      setDeletingId(null);
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
          <h1 className="text-3xl font-black text-white tracking-tight">Workflows</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Automation Pipelines
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: 'Total Workflows', value: workflows.length, icon: Zap }].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-indigo-500/10">
              <s.icon className="w-5 h-5 text-indigo-400" />
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

      {showForm && (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            New Workflow
          </h3>
          <input
            type="text"
            placeholder="Workflow name"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-indigo-500/40"
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Create
          </button>
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center gap-4 text-center">
          <Zap className="w-12 h-12 text-gray-700" />
          <p className="text-sm font-medium text-gray-500">
            No workflows have been created for this workspace yet.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:underline"
          >
            Create your first workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10">
                    <Zap className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-base font-black text-white">{wf.name ?? wf.id}</p>
                    <span className="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {wf.status ?? 'DRAFT'}
                    </span>
                  </div>
                </div>
                <button
                  disabled={deletingId === wf.id}
                  onClick={() => handleDelete(wf)}
                  className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === wf.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
