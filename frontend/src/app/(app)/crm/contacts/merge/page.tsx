'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { contactService } from '@/services/contact.service';

export default function ContactMergePage() {
  const [primaryId, setPrimaryId] = useState('');
  const [secondaryId, setSecondaryId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMerge = async () => {
    setLoading(true);
    try {
      await contactService.mergeContacts(primaryId, secondaryId);
      toast.success('Contacts merged');
    } catch {
      toast.error('Merge failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">Merge Contacts</h1>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Primary contact ID (kept)</label><input value={primaryId} onChange={(e) => setPrimaryId(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <div><label className="text-sm font-medium">Secondary contact ID (merged in)</label><input value={secondaryId} onChange={(e) => setSecondaryId(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <button type="button" disabled={loading} onClick={() => void handleMerge()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50">Merge Contacts</button>
      </div>
    </div>
  );
}
