'use client';

import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, History, DollarSign, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { parseApiData } from '@/lib/api/parse-response';
import { billingService, type Invoice, type Subscription } from '@/services/billing.service';

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usage, setUsage] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [subRes, invoiceRes, usageRes] = await Promise.all([
          billingService.getSubscription(),
          billingService.getInvoices(),
          billingService.getUsage(),
        ]);
        setSubscription(parseApiData<Subscription>(subRes) ?? subRes.data ?? null);
        setInvoices(parseApiData<Invoice[]>(invoiceRes) ?? invoiceRes.data ?? []);
        setUsage(parseApiData<Record<string, number>>(usageRes) ?? usageRes.data ?? {});
      } catch {
        toast.error('Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const limits = [
    {
      name: 'Contacts',
      used: usage.contacts_limit ?? 0,
      total: 10000,
      color: 'bg-blue-600',
    },
    {
      name: 'Deals',
      used: usage.deals_limit ?? 0,
      total: 10000,
      color: 'bg-emerald-500',
    },
    {
      name: 'AI Tokens',
      used: usage.ai_tokens ?? 0,
      total: 500000,
      color: 'bg-amber-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-8 rounded-xl border border-border backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide border border-emerald-500/20">
              Capital Layer Active
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-foreground tracking-tighter uppercase">
            Fiscal Orchestration
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-bold uppercase tracking-wide">
            Manage tenant subscription cycles, usage vectors, and billing artifacts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 border border-border shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 space-y-8 text-foreground">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  Current Plan
                </p>
                <h2 className="text-3xl font-semibold tracking-tight mt-2">
                  {subscription?.status ?? 'ACTIVE'}
                </h2>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                Billing Cycle
              </p>
              <p className="text-xl font-semibold">{subscription?.billingCycle ?? 'MONTHLY'}</p>
            </div>
            {subscription?.currentPeriodEnd && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  Renews
                </p>
                <p className="text-sm font-bold">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 p-10 rounded-xl bg-card border border-border space-y-8">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-700 dark:text-blue-400" /> Usage Vectors
          </h3>
          <div className="space-y-6">
            {limits.map((limit) => {
              const pct = limit.total > 0 ? Math.min(100, (limit.used / limit.total) * 100) : 0;
              return (
                <div key={limit.name}>
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wide mb-2">
                    <span className="text-muted-foreground">{limit.name}</span>
                    <span className="text-foreground">
                      {limit.used} / {limit.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-card overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', limit.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-8 py-6 border-b border-border flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Invoice History
          </h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-card">
              {['Invoice', 'Date', 'Amount', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-sm font-bold text-foreground">
                  {inv.number ?? inv.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-blue-700 dark:text-blue-400">
                  {inv.currency ?? 'USD'} {Number(inv.total).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wide">
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {inv.pdfUrl && (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground dark:hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
