'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';

interface VoiceSettings {
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone_number?: string;
  voice_default_profile?: string;
  voice_routing_number?: string;
}

export default function VoiceSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>({});

  useEffect(() => {
    void api
      .get<{ data: VoiceSettings }>('/voice/settings')
      .then((res) => setSettings(res.data.data ?? {}))
      .catch(() => toast.error('Failed to load voice settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch<{ data: VoiceSettings }>('/voice/settings', settings);
      setSettings(res.data.data ?? settings);
      toast.success('Voice settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">Voice Settings</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium">Twilio Account SID</label>
          <input
            value={settings.twilio_account_sid ?? ''}
            onChange={(e) => setSettings((prev) => ({ ...prev, twilio_account_sid: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Auth Token</label>
          <input
            type="password"
            value={settings.twilio_auth_token ?? ''}
            onChange={(e) => setSettings((prev) => ({ ...prev, twilio_auth_token: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">From Number</label>
          <input
            value={settings.twilio_phone_number ?? ''}
            onChange={(e) => setSettings((prev) => ({ ...prev, twilio_phone_number: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Default AI Voice Profile</label>
          <input
            value={settings.voice_default_profile ?? 'shimmer'}
            onChange={(e) => setSettings((prev) => ({ ...prev, voice_default_profile: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Human Routing Number</label>
          <input
            value={settings.voice_routing_number ?? ''}
            onChange={(e) => setSettings((prev) => ({ ...prev, voice_routing_number: e.target.value }))}
            placeholder="+15551234567"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> Save
        </button>
      </div>
    </div>
  );
}
