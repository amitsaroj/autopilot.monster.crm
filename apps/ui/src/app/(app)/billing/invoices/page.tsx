import { FileText, Download, Plus, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

const invoices = [
  { id: 'INV-2024-010', period: 'October 2024', amount: '$960.00', plan: 'Enterprise', status: 'Paid', paid: 'Oct 1, 2024' },
  { id: 'INV-2024-009', period: 'September 2024', amount: '$960.00', plan: 'Enterprise', status: 'Paid', paid: 'Sep 1, 2024' },
  { id: 'INV-2024-008', period: 'August 2024', amount: '$960.00', plan: 'Enterprise', status: 'Paid', paid: 'Aug 1, 2024' },
  { id: 'INV-2024-007', period: 'July 2024', amount: '$480.00', plan: 'Professional', status: 'Paid', paid: 'Jul 1, 2024' },
  { id: 'INV-2024-006', period: 'June 2024', amount: '$480.00', plan: 'Professional', status: 'Paid', paid: 'Jun 1, 2024' },
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-description">All billing history and receipts</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Download className="h-4 w-4" />Export All</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Paid (2024)', value: '$4,800', icon: CheckCircle, color: 'text-green-400' },
          { label: 'Current Plan', value: 'Enterprise', icon: CreditCard, color: 'text-[hsl(246,80%,60%)]' },
          { label: 'Next Invoice', value: 'Nov 1, 2024', icon: Clock, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-lg font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Period</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid On</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/billing/invoices/${inv.id}`} className="flex items-center gap-2 font-mono text-xs font-semibold text-[hsl(246,80%,60%)] hover:underline">
                    <FileText className="h-4 w-4" />{inv.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{inv.period}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)] text-xs rounded-full">{inv.plan}</span></td>
                <td className="px-4 py-3 font-bold text-foreground">{inv.amount}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full flex items-center gap-1 w-fit">
                    <CheckCircle className="h-3 w-3" />{inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{inv.paid}</td>
                <td className="px-4 py-3">
                  <button className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"><Download className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
