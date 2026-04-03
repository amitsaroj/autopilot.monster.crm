"use client";

import { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Filter, Download, Receipt, 
  ArrowRight, CheckCircle2, XCircle, Clock, 
  MoreVertical, Building2, Calendar, DollarSign,
  AlertCircle, Loader2, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  tenantId: string;
  tenant?: { name: string };
  amount: number;
  total: number;
  currency: string;
  status: 'PAID' | 'OPEN' | 'VOID' | 'UNCOLLECTIBLE';
  createdAt: string;
  dueDate?: string;
  stripeInvoiceId?: string;
}

export default function GlobalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/invoices');
      const json = await res.json();
      if (json.data) setInvoices(json.data);
    } catch (e) {
      toast.error('Failed to sync platform financial records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: any = {
      PAID: 'bg-green-500/10 text-green-500 border-green-500/20',
      OPEN: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      VOID: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      UNCOLLECTIBLE: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Financial Directory</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Platform-Wide Revenue Manifest ({invoices.length})</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-6 py-3 bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
           </button>
           <button className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20">
              <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Global Persistence Controller */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
            <input 
               type="text" 
               placeholder="Search by invoice ID or tenant name..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
            {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
         </div>
         <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Status Filter</span>
            <select className="bg-transparent border-none outline-none text-xs text-indigo-400 font-bold uppercase tracking-widest">
               <option>All Status</option>
               <option>Paid Only</option>
               <option>Overdue</option>
            </select>
         </div>
         <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Revenue Today</span>
            <span className="text-sm font-black text-white">$12,480.00</span>
         </div>
      </div>

      {/* Invoice Table */}
      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.01] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Transaction Artifact</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Workspace Context</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Economic Value</th>
                     <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.05]">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all">
                                <Receipt className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">INV-{inv.id.substring(0, 8).toUpperCase()}</p>
                                <p className="text-[10px] text-gray-600 font-mono mt-0.5 flex items-center gap-1">
                                   <Calendar className="w-3 h-3" /> {new Date(inv.createdAt).toLocaleDateString()}
                                </p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          {getStatusBadge(inv.status)}
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                             <Building2 className="w-3.5 h-3.5" /> {inv.tenant?.name || 'Unknown Workspace'}
                          </div>
                          <p className="text-[9px] text-gray-600 font-mono mt-1 uppercase tracking-tighter">Tenant ID: {inv.tenantId.substring(0, 12)}...</p>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex flex-col items-start gap-1">
                             <span className="text-lg font-black text-white">
                                <span className="text-xs text-gray-600 mr-1">{inv.currency}</span>
                                {(inv.total || inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                             </span>
                             <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1">
                                <CreditCard className="w-2.5 h-2.5" /> Linked to Stripe
                             </span>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 px-1">
                             <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                <ExternalLink className="w-4 h-4" />
                             </button>
                             <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white transition-all">
                                <MoreVertical className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-8 py-24 text-center">
                         <div className="flex flex-col items-center gap-6 text-gray-700">
                            <DollarSign className="w-16 h-16 opacity-20" />
                            <div className="space-y-1">
                               <p className="text-lg font-bold text-gray-500">No transactions recorded</p>
                               <p className="text-xs text-gray-600">Sync with payment provider to populate financial artifacts.</p>
                            </div>
                            <button onClick={fetchInvoices} className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2">Initiate Provider Sync <ArrowRight className="w-4 h-4" /></button>
                         </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Global Financial Control CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="relative z-10 space-y-4">
               <h3 className="text-2xl font-black text-white">Advanced Revenue Reconciliation</h3>
               <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                  Generate comprehensive platform-wide tax reports, manage cross-border VAT reconciliation, and orchestrate global subscription overrides.
               </p>
               <button className="px-6 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-black uppercase tracking-widest text-white hover:bg-white/[0.08] transition-all">Financial Settings</button>
            </div>
         </div>
         <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors" />
            <div className="relative z-10 space-y-4">
               <h3 className="text-2xl font-black text-white text-red-500/80">Churn & Deficit Monitoring</h3>
               <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                  Review failed payment artifacts, identify high-churn workspace clusters, and provision advanced credit-based recovery mechanisms.
               </p>
               <button className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-all">Deficit Artifacts</button>
            </div>
         </div>
      </div>

      {/* Persistence Policy */}
      <div className="p-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.01] flex items-center gap-6">
         <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <AlertCircle className="w-6 h-6" />
         </div>
         <div>
            <h4 className="text-sm font-bold text-white">Systemic Record Retention</h4>
            <p className="text-xs text-gray-500">Financial artifacts are cryptographically locked after reconciliation and cannot be modified. All updates must be orchestrated via Stripe Provider Hooks to maintain ledger integrity.</p>
         </div>
      </div>

    </div>
  );
}
