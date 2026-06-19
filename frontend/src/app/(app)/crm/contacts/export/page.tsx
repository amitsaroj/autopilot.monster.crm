'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { contactService } from '@/services/contact.service';

export default function ContactExportPage() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await contactService.exportContacts();
      const csv = (res as { data: { data: string } }).data?.data ?? '';
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 space-y-4">
      <h1 className="text-2xl font-bold">Export Contacts</h1>
      <p className="text-sm text-muted-foreground">Download all contacts as CSV.</p>
      <button type="button" disabled={loading} onClick={() => void handleExport()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50">Download CSV</button>
    </div>
  );
}
