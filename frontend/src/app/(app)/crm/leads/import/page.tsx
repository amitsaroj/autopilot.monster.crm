'use client';

import { useState } from 'react';
import { CsvImportModal } from '@/components/crm/CsvImportModal';

export default function LeadImportPage() {
  const [open, setOpen] = useState(true);
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-4">Import Leads</h1>
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Open Import Wizard</button>
      <CsvImportModal isOpen={open} onClose={() => setOpen(false)} onSuccess={() => setOpen(false)} entityType="lead" />
    </div>
  );
}
