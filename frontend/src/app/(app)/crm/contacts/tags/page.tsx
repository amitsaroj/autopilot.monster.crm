'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { crmMetadataService, CrmTag } from '@/services/crm-metadata.service';

export default function ContactTagsPage() {
  const [tags, setTags] = useState<CrmTag[]>([]);
  const [name, setName] = useState('');

  const load = () => void crmMetadataService.getTags().then((r) => setTags(r.data.data ?? []));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await crmMetadataService.createTag({ name });
      setName('');
      load();
      toast.success('Tag created');
    } catch {
      toast.error('Failed to create tag');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">Contact Tags</h1>
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag name" className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" />
        <button type="button" onClick={() => void handleCreate()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Add</button>
      </div>
      <ul className="divide-y rounded-xl border border-border bg-card">
        {tags.map((t) => (
          <li key={t.id} className="flex items-center justify-between p-4">
            <span>{t.name}</span>
            <button type="button" onClick={() => void crmMetadataService.deleteTag(t.id).then(load)} className="text-sm text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
