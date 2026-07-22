'use client';

import { useEffect, useState } from 'react';
import { Activity, Loader2, AlertCircle } from 'lucide-react';
import { billingService } from '@/services/billing.service';
import { parseApiData } from '@/lib/api/parse-response';

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BillingUsagePage() {
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
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usage History</h1>
          <p className="page-description">Metered resource usage for your workspace</p>
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
            Usage metrics will appear here once your workspace starts consuming billable resources.
          </p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Usage Metrics</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Metric</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Units Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map(([key, value]) => (
                <tr key={key} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 text-sm text-foreground">{formatKey(key)}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground text-right font-semibold">
                    {value.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-4 border-t border-border bg-muted/20 flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">Total Units</span>
            <span className="text-sm font-bold text-foreground">{total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
