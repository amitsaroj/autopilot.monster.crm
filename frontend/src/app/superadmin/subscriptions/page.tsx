'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import {
  CreditCard,
  Search,
  Loader2,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: string;
  billingCycle?: string;
  currentPeriodEnd?: string;
  tenant?: { name: string };
  plan?: { name: string };
  createdAt: string;
}

export default function GlobalSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/subscriptions');
      const json = res.data;
      if (json.data) setSubscriptions(json.data);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filtered = subscriptions.filter((sub) => {
    const term = search.toLowerCase();
    return (
      sub.id.toLowerCase().includes(term) ||
      sub.tenantId.toLowerCase().includes(term) ||
      (sub.tenant?.name ?? '').toLowerCase().includes(term) ||
      (sub.plan?.name ?? sub.planId).toLowerCase().includes(term)
    );
  });

  const statusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'CANCELED':
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'TRIALING':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Global Subscriptions</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Platform Billing Registry ({filtered.length})
          </p>
        </div>
        <button
          onClick={fetchSubscriptions}
          disabled={loading}
          className="px-5 py-3 bg-card border border-border rounded-xl text-xs font-semibold text-foreground uppercase tracking-wide hover:bg-white/[0.1] transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by tenant, plan, or subscription ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-600"
        />
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-card">
                {['Tenant', 'Plan', 'Status', 'Billing Cycle', 'Period End', 'Created'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {sub.tenant?.name ?? 'Unknown Tenant'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{sub.tenantId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-foreground">
                    {sub.plan?.name ?? sub.planId}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${statusStyle(sub.status)}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs text-muted-foreground">{sub.billingCycle ?? '—'}</td>
                  <td className="px-6 py-5 text-xs text-muted-foreground">
                    {sub.currentPeriodEnd
                      ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-6 py-5 text-xs text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto opacity-20 mb-3" />
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-card border border-border flex items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Invoice Registry</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Review platform-wide invoice artifacts and payment reconciliation.
          </p>
        </div>
        <a
          href="/superadmin/invoices"
          className="text-blue-700 dark:text-blue-400 text-xs font-semibold flex items-center gap-2 uppercase tracking-wide hover:translate-x-1 transition-transform"
        >
          View Invoices <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
