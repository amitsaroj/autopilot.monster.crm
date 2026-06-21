'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crmReportService } from '@/services/crm-report.service';

export default function CrmReportsPage() {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [pipeline, setPipeline] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([crmReportService.getSummary(), crmReportService.getPipeline()]).then(([s, p]) => {
      setSummary((s as { data: { data: Record<string, unknown> } }).data?.data ?? null);
      setPipeline((p as { data: { data: unknown[] } }).data?.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">CRM Reports</h1>
      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(summary).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase text-muted-foreground">{k}</p>
              <p className="mt-1 text-2xl font-bold">{String(v)}</p>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Pipeline Distribution</h2>
        <pre className="mt-4 overflow-auto text-xs">{JSON.stringify(pipeline, null, 2)}</pre>
      </div>
    </div>
  );
}
