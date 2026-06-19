'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { importExportService } from '@/services/import-export.service';

export default function AnalyticsExportPage() {
  const [entityType, setEntityType] = useState('contacts');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await importExportService.startExport(entityType, 'csv');
      toast.success(`Export job started: ${res.data.data.id}`);
    } catch {
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <h1 className="text-2xl font-bold">Analytics Export</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Entity</label><select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">{['contacts', 'leads', 'deals', 'companies'].map((e) => <option key={e}>{e}</option>)}</select></div>
        <button type="button" disabled={loading} onClick={() => void handleExport()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50">Start Export Job</button>
      </div>
    </div>
  );
}
