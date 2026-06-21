'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { flowService, Flow } from '@/services/flow.service';

export default function BuilderFormsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void flowService.list().then((r) => setFlows((r.data.data ?? []).filter((f) => f.type === 'whatsapp'))).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Forms</h1><Link href="/builder/forms/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">New Form</Link></div>
      <ul className="divide-y rounded-xl border border-border bg-card">{flows.map((f) => <li key={f.id}><Link href={`/builder/forms/${f.id}/edit`} className="block p-4 hover:bg-muted/50">{f.name}</Link></li>)}</ul>
    </div>
  );
}
