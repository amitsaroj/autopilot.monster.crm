"use client";

import { useState, useEffect } from 'react';
import { FileText, Search, Download, Eye, CreditCard, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { billingService } from '@/services/billing.service';

interface InvoiceRow {
  id: string;
  invoiceNumber?: string;
  planName?: string;
  amount?: number;
  status?: string;
  periodStart?: string;
  paidAt?: string;
  paymentMethod?: string;
}

export default function AdminBillingHistoryPage() {
  const [history, setHistory] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await billingService.getInvoices();
        const payload = res.data?.data ?? res.data;
        setHistory(Array.isArray(payload) ? payload : []);
      } catch {
        toast.error('Failed to load billing history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = history.filter(h =>
    String(h.invoiceNumber ?? h.id).toLowerCase().includes(search.toLowerCase()) ||
    String(h.planName ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPaid = history
    .filter(h => (h.status ?? '').toUpperCase() === 'PAID')
    .reduce((s, h) => s + Number(h.amount ?? 0), 0);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Billing History</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Invoice & Payment History</p>
        </div>
        <button className="px-5 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2">
          <Download className="w-4 h-4" /> Export All
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: `$${totalPaid}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CreditCard },
          { label: 'Successful', value: history.filter(h => (h.status ?? '').toUpperCase() === 'PAID').length, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: CheckCircle2 },
          { label: 'Failed', value: history.filter(h => (h.status ?? '').toUpperCase() === 'FAILED').length, color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Invoice', 'Plan', 'Amount', 'Status', 'Paid On', ''].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(inv => (
              <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-xs font-mono font-bold text-indigo-300">{inv.invoiceNumber ?? inv.id}</td>
                <td className="px-5 py-4 text-xs text-gray-300">{inv.planName ?? '—'}</td>
                <td className="px-5 py-4 text-sm font-black text-white">${Number(inv.amount ?? 0)}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${(inv.status ?? '').toUpperCase() === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{inv.status ?? 'UNKNOWN'}</span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'}</td>
                <td className="px-5 py-4">
                  <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
