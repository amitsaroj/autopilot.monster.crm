'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { flowService, Flow } from '@/services/flow.service';

export default function BuilderPagesPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void flowService.list().then((r) => setFlows(r.data.data ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Builder Pages</h1>
        <Link href="/builder/pages/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">New Page</Link>
      </div>
      <ul className="divide-y rounded-xl border border-border bg-card">
        {flows.map((f) => (
          <li key={f.id}><Link href={`/builder/pages/${f.id}/edit`} className="block p-4 hover:bg-muted/50"><p className="font-medium">{f.name}</p><p className="text-xs text-muted-foreground">{f.type} · {f.isPublished ? 'Published' : 'Draft'}</p></Link></li>
        ))}
      </ul>
    </div>
  );
}
