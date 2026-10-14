'use client';

import { useEffect, useState } from 'react';
import { Bot, Plus, Loader2, Settings, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminAiService } from '@/services/sub-admin-ai.service';

interface AiConfig {
  id: string;
  key?: string;
  model?: string;
  provider?: string;
  value?: string;
  [k: string]: unknown;
}

function unwrapList(response: any): AiConfig[] {
  const payload = response?.data ?? response;
  const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
  return Array.isArray(list) ? list : [];
}

export default function SubAdminAiPage() {
  const [configs, setConfigs] = useState<AiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ key: '', model: '', value: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await subAdminAiService.getConfigs();
      setConfigs(unwrapList(res));
    } catch {
      toast.error('Failed to load AI configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSave = async () => {
    if (!form.key.trim()) {
      toast.error('Config key is required');
      return;
    }
    setSaving(true);
    try {
      await subAdminAiService.updateConfig(form);
      toast.success('AI configuration saved');
      setForm({ key: '', model: '', value: '' });
      setShowForm(false);
      await load();
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            AI Configuration
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Workspace Model &amp; Key Settings
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Config
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: 'Total Configs', value: configs.length, icon: Bot }].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-blue-500/10">
              <s.icon className="w-5 h-5 text-blue-700 dark:text-blue-400" />
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

      {showForm && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            New AI Config
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Key (e.g. default_model)"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              className="p-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-gray-600 outline-none focus:border-blue-500/40"
            />
            <input
              type="text"
              placeholder="Model (e.g. gpt-4o)"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              className="p-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-gray-600 outline-none focus:border-blue-500/40"
            />
            <input
              type="text"
              placeholder="Value"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              className="p-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-gray-600 outline-none focus:border-blue-500/40"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
            Save Config
          </button>
        </div>
      )}

      {configs.length === 0 ? (
        <div className="p-16 rounded-2xl bg-card border border-border flex flex-col items-center gap-4 text-center">
          <Bot className="w-12 h-12 text-gray-700" />
          <p className="text-sm font-medium text-muted-foreground">
            No AI configuration has been set for this workspace yet.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide hover:underline"
          >
            Add the first config
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {configs.map((cfg) => (
            <div
              key={cfg.id}
              className="p-6 rounded-2xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <KeyRound className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-foreground">{cfg.key ?? cfg.id}</p>
              </div>
              <div className="space-y-2">
                {Object.entries(cfg)
                  .filter(([k]) => !['id', 'key'].includes(k))
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-muted-foreground uppercase tracking-wide font-semibold text-xs">
                        {k}
                      </span>
                      <span className="text-foreground font-mono truncate max-w-[60%]">
                        {String(v ?? '—')}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
