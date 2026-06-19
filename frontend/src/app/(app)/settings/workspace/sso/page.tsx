'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantSettingsService } from '@/services/tenant-settings.service';

export default function SsoSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sso_enabled: 'false', sso_provider: 'saml', sso_entity_id: '', sso_metadata_url: '' });

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(form)) {
        await tenantSettingsService.updateSetting({ key, value, group: 'sso' });
      }
      toast.success('SSO settings saved');
    } catch {
      toast.error('Failed to save SSO settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">SSO Configuration</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Enabled</label><select value={form.sso_enabled} onChange={(e) => setForm({ ...form, sso_enabled: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="false">Disabled</option><option value="true">Enabled</option></select></div>
        <div><label className="text-sm font-medium">Provider</label><select value={form.sso_provider} onChange={(e) => setForm({ ...form, sso_provider: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="saml">SAML</option><option value="oidc">OIDC</option></select></div>
        <div><label className="text-sm font-medium">Entity ID</label><input value={form.sso_entity_id} onChange={(e) => setForm({ ...form, sso_entity_id: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <div><label className="text-sm font-medium">Metadata URL</label><input value={form.sso_metadata_url} onChange={(e) => setForm({ ...form, sso_metadata_url: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" /> Save</button>
      </div>
    </div>
  );
}
