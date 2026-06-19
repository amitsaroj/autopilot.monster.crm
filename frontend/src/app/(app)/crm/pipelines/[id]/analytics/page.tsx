'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { forecastService } from '@/services/forecast.service';

export default function PipelineAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void forecastService.getByStage(id).then((r) => setData((r as { data: { data: unknown[] } }).data?.data ?? [])).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <Link href={`/crm/pipelines/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Pipeline</Link>
      <h1 className="text-2xl font-bold">Pipeline Analytics</h1>
      <pre className="overflow-auto rounded-xl border border-border bg-card p-4 text-xs">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
