"use client";

import { useState } from 'react';
import { FileText, Search, Download, Eye, Clock, CreditCard, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const mockHistory = [
  { id: '1', invoiceNum: 'INV-2025-003', plan: 'Growth Plan', amount: 149, status: 'PAID', period: 'Mar 2025', paidOn: '2025-03-01', method: 'Visa ****4242' },
  { id: '2', invoiceNum: 'INV-2025-002', plan: 'Growth Plan', amount: 149, status: 'PAID', period: 'Feb 2025', paidOn: '2025-02-01', method: 'Visa ****4242' },
  { id: '3', invoiceNum: 'INV-2025-001', plan: 'Growth Plan', amount: 149, status: 'PAID', period: 'Jan 2025', paidOn: '2025-01-01', method: 'Visa ****4242' },
  { id: '4', invoiceNum: 'INV-2024-012', plan: 'Starter Plan', amount: 49, status: 'PAID', period: 'Dec 2024', paidOn: '2024-12-01', method: 'Visa ****4242' },
  { id: '5', invoiceNum: 'INV-2024-011', plan: 'Starter Plan', amount: 49, status: 'FAILED', period: 'Nov 2024', paidOn: '—', method: 'Expired Card' },
  { id: '6', invoiceNum: 'INV-2024-010', plan: 'Starter Plan', amount: 49, status: 'PAID', period: 'Oct 2024', paidOn: '2024-10-01', method: 'Visa ****4242' },
];

export default function AdminBillingHistoryPage() {
  const [search, setSearch] = useState('');
  const filtered = mockHistory.filter(h => h.invoiceNum.toLowerCase().includes(search.toLowerCase()) || h.plan.toLowerCase().includes(search.toLowerCase()));
  const totalPaid = mockHistory.filter(h => h.status === 'PAID').reduce((s, h) => s + h.amount, 0);

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
          { label: 'Successful', value: mockHistory.filter(h => h.status === 'PAID').length, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: CheckCircle2 },
          { label: 'Failed', value: mockHistory.filter(h => h.status === 'FAILED').length, color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
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
              {['Invoice', 'Plan', 'Period', 'Amount', 'Status', 'Payment Method', 'Paid On', ''].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(inv => (
              <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-xs font-mono font-bold text-indigo-300">{inv.invoiceNum}</td>
                <td className="px-5 py-4 text-xs text-gray-300">{inv.plan}</td>
                <td className="px-5 py-4 text-xs text-gray-400">{inv.period}</td>
                <td className="px-5 py-4 text-sm font-black text-white">${inv.amount}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{inv.status}</span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400 font-mono">{inv.method}</td>
                <td className="px-5 py-4 text-xs text-gray-500">{inv.paidOn}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Download className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
