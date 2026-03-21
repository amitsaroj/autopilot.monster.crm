"use client";

import { Download, Receipt, ExternalLink, Filter, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const invoices = [
  { id: 'INV-2024-009', date: 'Oct 01, 2024', amount: 2499.00, status: 'Paid', method: 'Visa •••• 4242', plan: 'Enterprise OS' },
  { id: 'INV-2024-008', date: 'Sep 01, 2024', amount: 2499.00, status: 'Paid', method: 'Visa •••• 4242', plan: 'Enterprise OS' },
  { id: 'INV-2024-007', date: 'Aug 01, 2024', amount: 2499.00, status: 'Paid', method: 'Visa •••• 4242', plan: 'Enterprise OS' },
  { id: 'INV-2024-006', date: 'Jul 01, 2024', amount: 2650.00, status: 'Paid', method: 'Visa •••• 4242', plan: 'Enterprise OS + Voice Overage' },
  { id: 'INV-2024-005', date: 'Jun 01, 2024', amount: 999.00, status: 'Paid', method: 'Mastercard •••• 8812', plan: 'Growth Plan' },
  { id: 'INV-2024-004', date: 'May 01, 2024', amount: 999.00, status: 'Failed', method: 'Mastercard •••• 8812', plan: 'Growth Plan' },
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      
      {/* Header */}
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
        
        <button className="flex items-center gap-2 px-4 py-2 bg-background border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Download All (CSV)
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by Invoice ID..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg hover:bg-muted text-foreground text-sm font-medium transition-colors bg-background">
          <Filter className="w-4 h-4" /> Filter by Status
        </button>
      </div>

      {/* Invoice Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Plan / Description</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Receipt className="w-4 h-4 text-muted-foreground" />
                      {inv.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{inv.date}</td>
                  <td className="px-6 py-4 text-muted-foreground">{inv.plan}</td>
                  <td className="px-6 py-4 font-bold text-foreground">
                    ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    {inv.status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        <AlertCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-muted-foreground hover:text-foreground font-medium transition-colors flex items-center gap-1">
                        HTML <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1">
                        PDF <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing <strong>1</strong> to <strong>6</strong> of <strong>24</strong> invoices</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-border rounded-lg bg-background hover:bg-muted transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 border border-border rounded-lg bg-background hover:bg-muted transition-colors">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
