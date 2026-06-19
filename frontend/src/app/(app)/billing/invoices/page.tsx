"use client";

import { useEffect, useState } from 'react';
import { Download, Receipt, ExternalLink, Filter, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { billingService, Invoice } from '@/services/billing.service';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await billingService.getInvoices();
        setInvoices(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const filtered = invoices.filter((inv) =>
    inv.number.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/billing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Billing</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Invoices</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Invoice History</h1>
          <p className="text-sm text-muted-foreground mt-1">View, download, and manage your past billing statements.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by Invoice ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg hover:bg-muted text-foreground text-sm font-medium transition-colors bg-background">
          <Filter className="w-4 h-4" /> Filter by Status
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/billing/invoices/${inv.id}`} className="flex items-center gap-2 font-medium text-foreground hover:text-primary">
                        <Receipt className="w-4 h-4 text-muted-foreground" />
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {inv.currency} {Number(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      {inv.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5" /> {inv.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/billing/invoices/${inv.id}`} className="text-muted-foreground hover:text-foreground font-medium transition-colors flex items-center gap-1">
                          View <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        {inv.pdfUrl && (
                          <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1">
                            PDF <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
