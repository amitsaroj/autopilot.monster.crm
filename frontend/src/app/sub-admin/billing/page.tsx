'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Receipt, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminBillingService } from '@/services/sub-admin-billing.service';

interface Subscription {
  id: string;
  planId: string;
  status: string;
  billingCycle: string;
  startedAt?: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialEndsAt?: string | null;
  cancelledAt?: string | null;
}

interface Invoice {
  id: string;
  number?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
}

function unwrapObj<T>(response: any): T | null {
  const payload = response?.data ?? response;
  return (payload?.data ?? payload ?? null) as T | null;
}

function unwrapArr<T>(response: any): T[] {
  const payload = response?.data ?? response;
  return (Array.isArray(payload) ? payload : (payload?.data ?? [])) as T[];
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  TRIALING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function SubAdminBillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [subRes, invRes] = await Promise.all([
          subAdminBillingService.getSubscription(),
          subAdminBillingService.getInvoices(),
        ]);
        setSubscription(unwrapObj<Subscription>(subRes));
        setInvoices(unwrapArr<Invoice>(invRes));
      } catch {
        toast.error('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Billing</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
          Workspace Subscription &amp; Invoices
        </p>
      </div>

      {subscription ? (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/10">
                <CreditCard className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-base font-black text-white">Current Subscription</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase ${
                STATUS_STYLES[subscription.status] ??
                'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}
            >
              {subscription.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">
                Billing Cycle
              </p>
              <p className="text-sm font-black text-white">{subscription.billingCycle}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">
                Started
              </p>
              <p className="text-sm font-black text-white">
                {subscription.startedAt
                  ? new Date(subscription.startedAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">
                Current Period Ends
              </p>
              <p className="text-sm font-black text-white">
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : '—'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">
                Trial Ends
              </p>
              <p className="text-sm font-black text-white">
                {subscription.trialEndsAt
                  ? new Date(subscription.trialEndsAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center text-gray-500 text-sm">
          No active subscription found.
        </div>
      )}

      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-400" /> Invoices
        </h2>
        {invoices.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center text-gray-500 text-sm">
            No invoices yet.
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <p className="text-sm font-black text-white">{inv.number ?? inv.id}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">
                    {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}
                  </span>
                  <span className="text-sm font-black text-white">
                    {inv.amount != null ? `$${inv.amount}` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
