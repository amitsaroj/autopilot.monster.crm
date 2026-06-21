'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantSettingsService } from '@/services/tenant-settings.service';

export default function InboxSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [autoAssign, setAutoAssign] = useState('false');
  const [defaultAssignee, setDefaultAssignee] = useState('');

  useEffect(() => {
    void tenantSettingsService.getSettings().then((res) => {
      const s = (res as { data?: Record<string, string> }).data ?? res;
      setAutoAssign(String(s?.inbox_auto_assign ?? 'false'));
      setDefaultAssignee(String(s?.inbox_default_assignee ?? ''));
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await tenantSettingsService.updateSetting({ key: 'inbox_auto_assign', value: autoAssign, group: 'inbox' });
      await tenantSettingsService.updateSetting({ key: 'inbox_default_assignee', value: defaultAssignee, group: 'inbox' });
      toast.success('Inbox settings saved');
    } catch {
      toast.error('Save failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">Inbox Settings</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Auto-assign conversations</label><select value={autoAssign} onChange={(e) => setAutoAssign(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="false">Off</option><option value="true">On</option></select></div>
        <div><label className="text-sm font-medium">Default assignee ID</label><input value={defaultAssignee} onChange={(e) => setDefaultAssignee(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <button type="button" onClick={() => void handleSave()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Save className="inline h-4 w-4 mr-1" /> Save</button>
      </div>
    </div>
  );
}
