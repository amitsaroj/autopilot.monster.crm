"use client";

import { useState, useEffect } from 'react';
import {
  CreditCard, Search, Loader2, Building2, Calendar,
  CheckCircle2, XCircle, Clock, RefreshCw, ArrowRight,
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
      const res = await fetch('/api/v1/admin/subscriptions');
      const json = await res.json();
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELED':
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'TRIALING':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Global Subscriptions</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Platform Billing Registry ({filtered.length})
          </p>
        </div>
        <button
          onClick={fetchSubscriptions}
          disabled={loading}
          className="px-5 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/[0.1] transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by tenant, plan, or subscription ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
        />
        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                {['Tenant', 'Plan', 'Status', 'Billing Cycle', 'Period End', 'Created'].map((h) => (
                  <th key={h} className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
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
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-sm font-bold text-white">{sub.tenant?.name ?? 'Unknown Tenant'}</p>
                        <p className="text-[10px] text-gray-600 font-mono">{sub.tenantId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-300">{sub.plan?.name ?? sub.planId}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusStyle(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs text-gray-400">{sub.billingCycle ?? '—'}</td>
                  <td className="px-6 py-5 text-xs text-gray-400">
                    {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-5 text-xs text-gray-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-600">
                    <CreditCard className="w-12 h-12 mx-auto opacity-20 mb-3" />
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-black text-white">Invoice Registry</h3>
          <p className="text-sm text-gray-500 mt-1">Review platform-wide invoice artifacts and payment reconciliation.</p>
        </div>
        <a
          href="/superadmin/invoices"
          className="text-indigo-400 text-xs font-black flex items-center gap-2 uppercase tracking-widest hover:translate-x-1 transition-transform"
        >
          View Invoices <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
