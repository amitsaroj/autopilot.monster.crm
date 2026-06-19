'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api/client';

interface Activity {
  id: string;
  type: string;
  subject: string;
  occurredAt: string;
}

export default function CrmTimelinePage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.get('/crm/activities').then((r) => {
      setItems((r as { data: { data: Activity[] } }).data?.data ?? (r as { data: Activity[] }).data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">CRM Timeline</h1>
      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.id} className="rounded-xl border border-border bg-card p-4">
            <p className="font-medium">{a.subject}</p>
            <p className="text-xs text-muted-foreground">{a.type} · {new Date(a.occurredAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
