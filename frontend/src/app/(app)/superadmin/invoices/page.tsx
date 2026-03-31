'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { adminInvoicesService } from '@/services/admin-invoices.service';

export default function SuperAdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await adminInvoicesService.findAll();
      setInvoices(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.number.toLowerCase().includes(search.toLowerCase()) ||
    inv.tenantId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Global Billing</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Monetization Engine / Ledger History</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-muted/50 border border-border/50 text-foreground rounded-xl hover:bg-muted transition-all font-bold text-sm">
            <Download className="h-4 w-4" />
            Export Ledger
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-border/30">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Search invoice number or tenant..."
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-transparent focus:border-brand/40 focus:bg-background/80 rounded-xl transition-all outline-none text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">{filteredInvoices.length} Transactions Found</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/20 text-left bg-muted/10">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Invoice Protocol</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Entity / Tenant</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Amount / Currency</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10 font-bold">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                   <td colSpan={5} className="px-6 py-4 h-16 bg-muted/5" />
                </tr>
              ))
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                   <FileText className="h-12 w-12 mx-auto mb-4 opacity-10" />
                   <p className="text-sm text-muted-foreground uppercase tracking-widest font-black">No Transaction History</p>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tighter group-hover:text-brand transition-colors">{inv.number}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(inv.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">{inv.tenantId.slice(0, 8)}...</p>
                    <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">Master Account</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black tracking-tighter">${inv.total}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{inv.currency} • SETTLED</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       {inv.status === 'PAID' ? (
                         <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                       ) : (
                         <Clock className="h-3.5 w-3.5 text-yellow-500" />
                       )}
                       <span className={`text-[10px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'text-green-500' : 'text-yellow-500'}`}>{inv.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 rounded-lg hover:bg-brand/10 hover:text-brand transition-all border border-transparent hover:border-brand/20">
                          <Download className="h-4 w-4" />
                       </button>
                       <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
