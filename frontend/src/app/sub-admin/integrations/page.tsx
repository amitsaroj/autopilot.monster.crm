'use client';

import { useEffect, useState } from 'react';
import { Plug, Plus, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminIntegrationsService } from '@/services/sub-admin-integrations.service';

interface Integration {
  id: string;
  key: string;
  value: unknown;
  group: string;
  createdAt: string;
  updatedAt: string;
}

function unwrap<T>(response: any, fallback: T): T {
  const payload = response?.data ?? response;
  return (payload?.data ?? payload ?? fallback) as T;
}

export default function SubAdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('{}');

  const load = async () => {
    setLoading(true);
    try {
      const res = await subAdminIntegrationsService.getIntegrations();
      setIntegrations(unwrap<Integration[]>(res, []));
    } catch {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    if (!key.trim()) {
      toast.error('Integration key is required');
      return;
    }
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      toast.error('Config must be valid JSON');
      return;
    }
    setSaving(true);
    try {
      await subAdminIntegrationsService.upsertIntegration({ key: key.trim(), value: parsedValue });
      toast.success('Integration saved');
      setShowForm(false);
      setKey('');
      setValue('{}');
      await load();
    } catch {
      toast.error('Failed to save integration');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this integration?')) return;
    setActionId(id);
    try {
      await subAdminIntegrationsService.deleteIntegration(id);
      toast.success('Integration removed');
      await load();
    } catch {
      toast.error('Failed to remove integration');
    } finally {
      setActionId(null);
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
          <h1 className="text-3xl font-black text-white tracking-tight">Integrations</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Workspace Integration Configs
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Integration'}
        </button>
      </div>

      {showForm && (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1.5">
              Key
            </label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. slack_webhook"
              className="w-full p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-gray-200 outline-none focus:border-indigo-500/30"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1.5">
              Config (JSON)
            </label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-gray-200 font-mono outline-none focus:border-indigo-500/30"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Integration
          </button>
        </div>
      )}

      {integrations.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
          <Plug className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No integrations configured for this workspace yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500 transition-all">
                    <Plug className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-base font-black text-white font-mono">{integration.key}</p>
                    <p className="text-xs text-gray-500">{integration.group}</p>
                  </div>
                </div>
              </div>
              <pre className="text-[10px] text-gray-500 bg-white/[0.02] rounded-xl p-3 mb-4 overflow-x-auto">
                {JSON.stringify(integration.value, null, 2)}
              </pre>
              <button
                onClick={() => handleDelete(integration.id)}
                disabled={actionId === integration.id}
                className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-white uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {actionId === integration.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
