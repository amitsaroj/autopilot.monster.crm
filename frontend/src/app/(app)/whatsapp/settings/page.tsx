'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantSettingsService } from '@/services/tenant-settings.service';

export default function WhatsappSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState('');
  const [wabaId, setWabaId] = useState('');

  useEffect(() => {
    void tenantSettingsService.getSettings().then((res) => {
      const settings = (res as { data?: Record<string, string> }).data ?? res;
      setToken(String(settings?.whatsapp_token ?? ''));
      setWabaId(String(settings?.whatsapp_business_account_id ?? ''));
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await tenantSettingsService.updateSetting({ key: 'whatsapp_token', value: token, group: 'whatsapp' });
      await tenantSettingsService.updateSetting({ key: 'whatsapp_business_account_id', value: wabaId, group: 'whatsapp' });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">WhatsApp Settings</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Access Token</label><input value={token} onChange={(e) => setToken(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <div><label className="text-sm font-medium">Business Account ID</label><input value={wabaId} onChange={(e) => setWabaId(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" /> Save</button>
      </div>
    </div>
  );
}
