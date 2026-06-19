'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { flowService, Flow } from '@/services/flow.service';

export default function FormSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void flowService.get(id).then((r) => setFlow(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const submissions = (flow?.definition as { submissions?: unknown[] })?.submissions ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <Link href={`/builder/forms/${id}/edit`} className="text-sm text-muted-foreground hover:text-foreground">← Edit Form</Link>
      <h1 className="text-2xl font-bold">Submissions: {flow?.name}</h1>
      {submissions.length === 0 ? <p className="text-sm text-muted-foreground">No submissions yet.</p> : <pre className="rounded-xl border border-border bg-card p-4 text-xs">{JSON.stringify(submissions, null, 2)}</pre>}
    </div>
  );
}
