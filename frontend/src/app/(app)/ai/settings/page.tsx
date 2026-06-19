'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { tenantSettingsService } from '@/services/tenant-settings.service';

export default function AiSettingsPage() {
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState('0.7');

  const handleSave = async () => {
    try {
      await tenantSettingsService.updateSetting({ key: 'ai_default_model', value: model, group: 'ai' });
      await tenantSettingsService.updateSetting({ key: 'ai_temperature', value: temperature, group: 'ai' });
      toast.success('AI settings saved');
    } catch {
      toast.error('Save failed');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <h1 className="text-2xl font-bold">AI Settings</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Default model</label><input value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <div><label className="text-sm font-medium">Temperature</label><input value={temperature} onChange={(e) => setTemperature(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <button type="button" onClick={() => void handleSave()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Save</button>
      </div>
    </div>
  );
}
