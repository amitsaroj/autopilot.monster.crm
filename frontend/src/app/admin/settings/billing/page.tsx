"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, History, DollarSign, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { parseApiData } from "@/lib/api/parse-response";
import { billingService, type Invoice, type Subscription } from "@/services/billing.service";

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
        toast.error("Failed to load billing data");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const limits = [
    {
      name: "Contacts",
      used: usage.contacts_limit ?? 0,
      total: 10000,
      color: "bg-indigo-500",
    },
    {
      name: "Deals",
      used: usage.deals_limit ?? 0,
      total: 10000,
      color: "bg-emerald-500",
    },
    {
      name: "AI Tokens",
      used: usage.ai_tokens ?? 0,
      total: 500000,
      color: "bg-amber-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white/[0.02] p-8 rounded-[40px] border border-white/[0.05] backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              Capital Layer Active
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Fiscal Orchestration</h1>
          <p className="text-gray-500 text-sm mt-1 font-bold uppercase tracking-widest">
            Manage tenant subscription cycles, usage vectors, and billing artifacts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-10 rounded-[50px] bg-gradient-to-br from-indigo-600 to-indigo-900 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 space-y-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Current Plan</p>
                <h2 className="text-3xl font-black tracking-tight mt-2">
                  {subscription?.status ?? "ACTIVE"}
                </h2>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Billing Cycle</p>
              <p className="text-xl font-black">{subscription?.billingCycle ?? "MONTHLY"}</p>
            </div>
            {subscription?.currentPeriodEnd && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Renews</p>
                <p className="text-sm font-bold">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 p-10 rounded-[50px] bg-white/[0.02] border border-white/[0.05] space-y-8">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-400" /> Usage Vectors
          </h3>
          <div className="space-y-6">
            {limits.map((limit) => {
              const pct = limit.total > 0 ? Math.min(100, (limit.used / limit.total) * 100) : 0;
              return (
                <div key={limit.name}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-gray-400">{limit.name}</span>
                    <span className="text-white">{limit.used} / {limit.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", limit.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <div className="px-8 py-6 border-b border-white/[0.05] flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Invoice History</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {["Invoice", "Date", "Amount", "Status", ""].map((h) => (
                <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-sm font-bold text-white">{inv.number ?? inv.id.slice(0, 8)}</td>
                <td className="px-6 py-4 text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-black text-indigo-400">
                  {inv.currency ?? "USD"} {Number(inv.total).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {inv.pdfUrl && (
                    <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white">
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">No invoices yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
