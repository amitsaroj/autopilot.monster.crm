'use client';

import { useEffect, useState } from 'react';
import { Settings, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminSettingsService } from '@/services/sub-admin-settings.service';

interface TenantSettings {
  id: string;
  name: string;
  slug: string;
  status: string;
  customDomain?: string | null;
  branding?: Record<string, unknown> | null;
}

function unwrap<T>(response: any, fallback: T): T {
  const payload = response?.data ?? response;
  return (payload?.data ?? payload ?? fallback) as T;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/20',
  TRIAL: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
};

export default function SubAdminSettingsPage() {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [branding, setBranding] = useState('{}');

  const load = async () => {
    setLoading(true);
    try {
      const res = await subAdminSettingsService.getSettings();
      const data = unwrap<TenantSettings>(res, {} as TenantSettings);
      setSettings(data);
      setName(data.name ?? '');
      setCustomDomain(data.customDomain ?? '');
      setBranding(JSON.stringify(data.branding ?? {}, null, 2));
    } catch {
      toast.error('Failed to load workspace settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSave = async () => {
    let parsedBranding: unknown;
    try {
      parsedBranding = JSON.parse(branding);
    } catch {
      toast.error('Branding must be valid JSON');
      return;
    }
    setSaving(true);
    try {
      await subAdminSettingsService.updateSettings({
        name: name.trim(),
        customDomain: customDomain.trim() || null,
        branding: parsedBranding,
      });
      toast.success('Workspace settings saved');
      await load();
    } catch {
      toast.error('Failed to save workspace settings');
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
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Workspace Configuration
          </p>
        </div>
        {settings?.status && (
          <span
            className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase ${
              STATUS_STYLES[settings.status] ?? 'bg-card text-muted-foreground border-border'
            }`}
          >
            {settings.status}
          </span>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-5 max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <Settings className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{settings?.slug}</p>
            <p className="text-xs text-muted-foreground">Workspace ID: {settings?.id}</p>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1.5">
            Workspace Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-blue-500/30"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1.5">
            Custom Domain
          </label>
          <input
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="app.yourcompany.com"
            className="w-full p-3 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-blue-500/30"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1.5">
            Branding (JSON)
          </label>
          <textarea
            value={branding}
            onChange={(e) => setBranding(e.target.value)}
            rows={6}
            className="w-full p-3 rounded-xl bg-card border border-border text-sm text-foreground font-mono outline-none focus:border-blue-500/30"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>
    </div>
  );
}
