'use client';

import { useState } from 'react';
import { CsvImportModal } from '@/components/crm/CsvImportModal';

export default function ContactImportPage() {
  const [open, setOpen] = useState(true);
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-4">Import Contacts</h1>
      <p className="text-sm text-muted-foreground mb-4">Upload a CSV file to import contacts.</p>
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Open Import Wizard</button>
      <CsvImportModal isOpen={open} onClose={() => setOpen(false)} onSuccess={() => setOpen(false)} entityType="contact" />
    </div>
  );
}
