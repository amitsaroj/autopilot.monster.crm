"use client";

import { useState } from 'react';
import {
  FileText, Search, Plus, Send, Eye, Download,
  Clock, CheckCircle2, XCircle, DollarSign, User,
  ArrowRight, Edit2, Trash2, AlertTriangle
} from 'lucide-react';

interface Quote {
  id: string;
  number: string;
  contact: string;
  company: string;
  total: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  validUntil: string;
  createdAt: string;
  items: number;
}

const mockQuotes: Quote[] = [
  { id: '1', number: 'QT-2025-001', contact: 'Sarah Johnson', company: 'Acme Corp', total: 14700, currency: 'USD', status: 'ACCEPTED', validUntil: '2025-05-01', createdAt: new Date(Date.now() - 604800000).toISOString(), items: 3 },
  { id: '2', number: 'QT-2025-002', contact: 'Mike Chen', company: 'GlobalSales Inc', total: 5980, currency: 'USD', status: 'SENT', validUntil: '2025-04-20', createdAt: new Date(Date.now() - 259200000).toISOString(), items: 2 },
  { id: '3', number: 'QT-2025-003', contact: 'Priya Patel', company: 'TechStartup X', total: 2940, currency: 'USD', status: 'DRAFT', validUntil: '2025-04-30', createdAt: new Date().toISOString(), items: 1 },
  { id: '4', number: 'QT-2025-004', contact: 'Tom Williams', company: 'Enterprise Co', total: 29940, currency: 'USD', status: 'DECLINED', validUntil: '2025-03-31', createdAt: new Date(Date.now() - 1209600000).toISOString(), items: 6 },
  { id: '5', number: 'QT-2025-005', contact: 'Alex Rivera', company: 'MediaHouse', total: 8880, currency: 'USD', status: 'EXPIRED', validUntil: '2025-03-15', createdAt: new Date(Date.now() - 2592000000).toISOString(), items: 4 },
];

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  SENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  DECLINED: 'bg-red-500/10 text-red-400 border-red-500/20',
  EXPIRED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function AdminCRMQuotesPage() {
  const [quotes] = useState<Quote[]>(mockQuotes);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = quotes.filter(q => {
    const matchSearch = q.contact.toLowerCase().includes(search.toLowerCase()) || q.number.toLowerCase().includes(search.toLowerCase()) || q.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalValue = quotes.filter(q => q.status === 'ACCEPTED').reduce((s, q) => s + q.total, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">CRM Quotes</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Proposals & Quote Management</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Quote
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Quotes', value: quotes.length, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Accepted', value: quotes.filter(q => q.status === 'ACCEPTED').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending', value: quotes.filter(q => q.status === 'SENT').length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Won Value', value: `$${(totalValue / 1000).toFixed(1)}K`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}>
              <DollarSign className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search by contact, company, or quote #..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none font-black uppercase tracking-widest">
          {['All', 'DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Quote #', 'Contact', 'Company', 'Items', 'Total', 'Valid Until', 'Status', ''].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(q => (
              <tr key={q.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <span className="text-sm font-mono font-bold text-indigo-300">{q.number}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-black border border-indigo-500/20">{q.contact.charAt(0)}</div>
                    <span className="text-sm text-white">{q.contact}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">{q.company}</td>
                <td className="px-5 py-4 text-xs text-gray-400">{q.items} items</td>
                <td className="px-5 py-4">
                  <span className="text-sm font-black text-white">${q.total.toLocaleString()}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />{new Date(q.validUntil).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[q.status]}`}>{q.status}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Send className="w-3.5 h-3.5" /></button>
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
