'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';

interface AiUsage {
  tenantId: string;
  tokensUsed: number;
  cost: number;
  metrics?: Record<string, number>;
  period?: string;
}

export default function AiUsagePage() {
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api
      .get('/ai/usage')
      .then((r) => setUsage(parseApiData<AiUsage>(r)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">AI Usage</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tokens this month</p>
          <p className="text-2xl font-bold">{usage?.tokensUsed?.toLocaleString() ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Estimated cost (USD)</p>
          <p className="text-2xl font-bold">${(usage?.cost ?? 0).toFixed(4)}</p>
        </div>
      </div>
      {usage?.metrics && Object.keys(usage.metrics).length > 0 && (
        <pre className="overflow-auto rounded-xl border border-border bg-card p-4 text-xs">
          {JSON.stringify(usage.metrics, null, 2)}
        </pre>
      )}
    </div>
  );
}
