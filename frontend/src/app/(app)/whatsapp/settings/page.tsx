'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantSettingsService } from '@/services/tenant-settings.service';

export default function WhatsappSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');

  useEffect(() => {
    void tenantSettingsService
      .getSettings()
      .then((res) => {
        const settings = (res as { data?: Record<string, string> }).data ?? res;
        setAccessToken(String(settings?.whatsapp_access_token ?? ''));
        setPhoneNumberId(String(settings?.whatsapp_phone_number_id ?? ''));
        setBusinessAccountId(String(settings?.whatsapp_business_account_id ?? ''));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        tenantSettingsService.updateSetting({
          key: 'whatsapp_access_token',
          value: accessToken,
          group: 'whatsapp',
        }),
        tenantSettingsService.updateSetting({
          key: 'whatsapp_phone_number_id',
          value: phoneNumberId,
          group: 'whatsapp',
        }),
        tenantSettingsService.updateSetting({
          key: 'whatsapp_business_account_id',
          value: businessAccountId,
          group: 'whatsapp',
        }),
      ]);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">WhatsApp Settings</h1>
      <p className="text-sm text-muted-foreground -mt-4">
        Connect your Meta WhatsApp Cloud API credentials. All three fields are required to send
        messages.
      </p>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium">Access Token</label>
          <input
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="EAAG..."
          />
        </div>
        <div>
          <label className="text-sm font-medium">Phone Number ID</label>
          <input
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="1234567890"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            From Meta Business Manager → WhatsApp → API Setup. Required to send messages — sends
            will fail without it even if the access token is valid.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Business Account ID</label>
          <input
            value={businessAccountId}
            onChange={(e) => setBusinessAccountId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="1234567890"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
      </div>
    </div>
  );
}
