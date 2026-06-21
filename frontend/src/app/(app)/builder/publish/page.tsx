'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { flowService, Flow } from '@/services/flow.service';

export default function BuilderPublishPage() {
  const [drafts, setDrafts] = useState<Flow[]>([]);

  useEffect(() => {
    void flowService.list().then((r) => setDrafts((r.data.data ?? []).filter((f) => !f.isPublished)));
  }, []);

  const handlePublish = async (id: string) => {
    try {
      await flowService.update(id, { isPublished: true });
      setDrafts((d) => d.filter((f) => f.id !== id));
      toast.success('Published');
    } catch {
      toast.error('Publish failed');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">Publish</h1>
      <ul className="divide-y rounded-xl border border-border bg-card">
        {drafts.length === 0 && <li className="p-4 text-sm text-muted-foreground">No drafts to publish.</li>}
        {drafts.map((f) => (
          <li key={f.id} className="flex items-center justify-between p-4">
            <span>{f.name} ({f.type})</span>
            <button type="button" onClick={() => void handlePublish(f.id)} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white">Publish</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
