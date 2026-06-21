'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { crmMetadataService, CrmSegment } from '@/services/crm-metadata.service';

export default function ContactSegmentsPage() {
  const [segments, setSegments] = useState<CrmSegment[]>([]);
  const [name, setName] = useState('');

  const load = () => void crmMetadataService.getSegments().then((r) => setSegments(r.data.data ?? []));
  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">Contact Segments</h1>
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Segment name" className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" />
        <button type="button" onClick={() => void crmMetadataService.createSegment({ name }).then(() => { setName(''); load(); toast.success('Created'); })} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Add</button>
      </div>
      <ul className="divide-y rounded-xl border border-border bg-card">{segments.map((s) => <li key={s.id} className="p-4">{s.name}</li>)}</ul>
    </div>
  );
}
