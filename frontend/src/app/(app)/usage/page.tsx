'use client';

import { useEffect, useState } from 'react';
import { Activity, Loader2, AlertCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { billingService } from '@/services/billing.service';
import { parseApiData } from '@/lib/api/parse-response';

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function UsagePage() {
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await billingService.getUsage();
        setUsage(parseApiData<Record<string, number>>(res) ?? res.data ?? {});
      } catch {
        setUsage({});
        setError('Unable to load usage data.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const entries = Object.entries(usage).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usage</h1>
          <p className="page-description">Resource consumption for your workspace</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-foreground">No usage recorded yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Usage metrics will appear here as your workspace consumes resources.
          </p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="space-y-4">
          {entries.map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[hsl(246,80%,60%)]/10">
                  <Activity className="h-4 w-4 text-[hsl(246,80%,60%)]" />
                </div>
                <div className="flex-1 flex justify-between items-baseline">
                  <p className="font-semibold text-foreground">{formatKey(key)}</p>
                  <p className="text-sm font-bold text-foreground">{value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-[hsl(246,80%,60%)]/20 bg-[hsl(246,80%,60%)]/5 p-5">
        <p className="text-sm font-semibold text-foreground mb-1">Need more capacity?</p>
        <p className="text-sm text-muted-foreground">
          Review your plan and upgrade options on the billing page.
        </p>
        <Link
          href="/billing/upgrade"
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Zap className="h-4 w-4" /> Upgrade Plan
        </Link>
      </div>
    </div>
  );
}
