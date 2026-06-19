'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { tenantSettingsService } from '@/services/tenant-settings.service';

export default function BuilderThemesPage() {
  const [primary, setPrimary] = useState('#4f46e5');
  const [font, setFont] = useState('Inter');

  const handleSave = async () => {
    try {
      await tenantSettingsService.updateSetting({ key: 'builder_primary_color', value: primary, group: 'builder' });
      await tenantSettingsService.updateSetting({ key: 'builder_font', value: font, group: 'builder' });
      toast.success('Theme saved');
    } catch {
      toast.error('Save failed');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <h1 className="text-2xl font-bold">Builder Themes</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Primary color</label><input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="mt-1 block h-10 w-full" /></div>
        <div><label className="text-sm font-medium">Font</label><input value={font} onChange={(e) => setFont(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <button type="button" onClick={() => void handleSave()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Save Theme</button>
      </div>
    </div>
  );
}
