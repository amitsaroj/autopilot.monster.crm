'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';
import {
  CreditCard,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Download,
  Receipt,
  Users,
  Loader2,
  Globe,
  ExternalLink,
  BarChart3,
  Wallet,
  Clock,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  planId: string;
  status: string;
  currentPeriodEnd: string;
  stripeCustomerId?: string;
  billingCycle: string;
}

interface Usage {
  [key: string]: number;
}

interface Invoice {
  id: string;
  number: string;
  total: number;
  currency: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export default function RefinedAdminBillingPage() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage>({});
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, usageRes, invoicesRes] = await Promise.all([
          api.get('/monetization/subscription'),
          api.get('/monetization/usage'),
          api.get('/monetization/invoices'),
        ]);
        setSub(parseApiData<Subscription>(subRes) ?? (subRes.data as Subscription));
        setUsage(parseApiData<Usage>(usageRes) ?? (usageRes.data as Usage) ?? {});
        const invoiceList =
          parseApiData<Invoice[]>(invoicesRes) ?? (invoicesRes.data as Invoice[]) ?? [];
        setInvoices(Array.isArray(invoiceList) ? invoiceList.slice(0, 3) : []);
      } catch {
        toast.error('Failed to synchronize financial artifacts');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePortal = async () => {
    setActionLoading('portal');
    try {
      const res = await api.post('/monetization/portal');
      const data = res.data?.data ?? res.data;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to initiate secure portal session');
      }
    } catch (err) {
      toast.error('Encryption bridge failure during portal launch');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide border border-emerald-500/20">
              Billing Active
            </span>
            <span className="text-xs text-muted-foreground font-mono">PROVIDER: STRIPE_LATEST</span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Financial Orchestration</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Subscription Lifecycle & Resource Quotas
          </p>
        </div>
        <button
          onClick={handlePortal}
          disabled={!!actionLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
        >
          {actionLoading === 'portal' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          Manage in Customer Portal
        </button>
      </div>

      {/* Main Billing Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plan Overview Card */}
        <div className="lg:col-span-2 p-10 rounded-xl bg-card border border-border relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />

          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Active Workspace Tier
                </h3>
                <h2 className="text-4xl font-semibold text-foreground tracking-tighter flex items-center gap-3">
                  {sub?.planId?.split('-')[0].toUpperCase() || 'FREE'} EDITION
                  <Zap className="w-8 h-8 text-blue-500 fill-blue-500/10" />
                </h2>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide bg-emerald-400/5 px-3 py-1 rounded-full border border-emerald-400/10 inline-block">
                  {sub?.status || 'Active'}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  NEXT SYNC:{' '}
                  {sub?.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-8 py-8 border-y border-border">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Billing Cycle
                </span>
                <p className="text-sm font-bold text-foreground uppercase">
                  {sub?.billingCycle || 'Monthly'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Pricing Point
                </span>
                <p className="text-sm font-bold text-foreground uppercase">Metered Enterprise Core</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Payment Infrastructure
                </span>
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  Stripe Secure <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="px-8 py-4 rounded-2xl bg-white text-[#0b0f19] text-xs font-semibold uppercase tracking-wide hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5">
                Modify Workspace Tier
              </button>
              <button className="px-8 py-4 rounded-2xl bg-card border border-border text-foreground text-xs font-semibold uppercase tracking-wide hover:bg-white/[0.08] transition-all">
                View Feature Entitlements
              </button>
            </div>
          </div>
        </div>

        {/* Usage Summary Sticky */}
        <div className="space-y-6">
          <div className="p-8 rounded-xl bg-card border border-border space-y-6">
            <h3 className="text-foreground font-semibold text-sm uppercase tracking-wide flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Real-time Quotas
            </h3>

            <div className="space-y-6">
              {[
                {
                  label: 'CRM Identity Quota',
                  usage: usage['contacts_limit'] || 0,
                  limit: 10000,
                  color: 'bg-blue-600',
                },
                {
                  label: 'AI Token Usage',
                  usage: usage['ai_tokens'] || 0,
                  limit: 500000,
                  color: 'bg-emerald-500',
                },
                {
                  label: 'Workflow Runs',
                  usage: usage['workflow_runs'] || 0,
                  limit: 5000,
                  color: 'bg-blue-600',
                },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-tighter">
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {item.usage} / {item.limit}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-card rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${Math.min((item.usage / item.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                * Usage is calculated globally across all team members in this workspace
                environment.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white space-y-4 shadow-2xl shadow-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide leading-tight">
                  Financial Health
                </h4>
                <p className="text-xs text-foreground/60 font-semibold uppercase tracking-tighter">
                  Automatic Recovery: ON
                </p>
              </div>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed font-medium">
              Your payment architecture is currently healthy. All historical invoices are reconciled
              and verified.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Artifacts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-xl bg-card border border-border group hover:bg-white/[0.03] transition-all">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-foreground font-semibold text-lg flex items-center gap-3 uppercase tracking-tighter">
              <History className="w-6 h-6 text-blue-500" /> Transaction Pulse
            </h3>
            <button className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide hover:underline transition-all">
              Full Archives
            </button>
          </div>

          <div className="space-y-4">
            {invoices.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No invoices recorded yet.</p>
            ) : (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-border group-hover:border-white/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-card text-muted-foreground">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-tighter">
                        {invoice.number}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        DATE: {new Date(invoice.paidAt ?? invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">
                      {invoice.currency} {Number(invoice.total).toFixed(2)}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">
                      {invoice.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-8 rounded-xl bg-card border border-border flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-4">
              <Download className="w-6 h-6 text-blue-500" />
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-tight">
                  Tax & Fiscal Artifacts
                </h4>
                <p className="text-xs text-muted-foreground">
                  Generate and download PDF statements for the current fiscal period.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-3xl bg-card border border-border flex items-center gap-4">
              <Globe className="w-6 h-6 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-tight">
                  Cross-Border Compliance
                </h4>
                <p className="text-xs text-muted-foreground">
                  Manage VAT/GST tax identification numbers for global entities.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-dashed border-border flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 opacity-50" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Next Rebalancing in 12 Days
              </span>
            </div>
            <ArrowRight className="w-5 h-5 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
