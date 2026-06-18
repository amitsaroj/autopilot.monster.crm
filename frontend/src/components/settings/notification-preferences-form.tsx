'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  notificationService,
  NotificationPreferences,
} from '@/services/notification.service';

export function NotificationPreferencesForm() {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: true,
    inApp: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await notificationService.getPreferences();
        if (res.data?.data) setPrefs(res.data.data);
      } catch {
        toast.error('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const toggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationService.updatePreferences(prefs);
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  }

  const items: Array<{ key: keyof NotificationPreferences; label: string }> = [
    { key: 'email', label: 'Email notifications' },
    { key: 'sms', label: 'SMS notifications' },
    { key: 'push', label: 'Push notifications' },
    { key: 'inApp', label: 'In-app notifications' },
  ];

  return (
    <div className="space-y-4 max-w-lg">
      {items.map((item) => (
        <label
          key={item.key}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer"
        >
          <span className="text-sm font-medium">{item.label}</span>
          <input
            type="checkbox"
            checked={prefs[item.key]}
            onChange={() => toggle(item.key)}
            className="h-4 w-4"
          />
        </label>
      ))}
      <button
        onClick={() => void handleSave()}
        disabled={saving}
        className="px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
