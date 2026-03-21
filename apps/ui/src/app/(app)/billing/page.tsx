import { CreditCard, FileText, TrendingUp, ArrowUpRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing</h1>
          <p className="page-description">Manage your subscription and payment</p>
        </div>
        <Link href="/billing/upgrade" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <ArrowUpRight className="h-4 w-4" /> Upgrade Plan
        </Link>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border border-[hsl(246,80%,60%)]/30 bg-gradient-to-br from-[hsl(246,80%,60%)]/5 to-transparent p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[hsl(246,80%,60%)] text-white text-xs font-bold rounded-full">PRO</span>
              <span className="text-xs text-muted-foreground">Current plan</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">$299<span className="text-sm font-normal text-muted-foreground">/month</span></h2>
            <p className="text-sm text-muted-foreground mt-1">Next billing: November 1, 2026</p>
          </div>
          <CheckCircle className="h-6 w-6 text-green-500" />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
          {[{ label: 'Users', used: 8, total: 25 }, { label: 'Contacts', used: 12489, total: 50000 }, { label: 'Storage', used: 4.2, total: 50 }, { label: 'AI Tokens', used: 1.2, total: 5 }].map((u) => (
            <div key={u.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{u.label}</span>
                <span className="text-xs font-medium">{u.used}/{u.total}{u.label === 'Storage' || u.label === 'AI Tokens' ? 'M' : ''}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(246,80%,60%)] rounded-full" style={{ width: `${Math.round((u.used / u.total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Invoices', href: '/billing/invoices', icon: FileText, desc: '14 invoices' },
          { label: 'Payment Methods', href: '/billing/payment-methods', icon: CreditCard, desc: 'Visa •••• 4242' },
          { label: 'Usage History', href: '/billing/usage', icon: TrendingUp, desc: 'Current period' },
        ].map((link) => (
          <Link key={link.label} href={link.href} className="rounded-xl border border-border bg-card p-5 hover:border-[hsl(246,80%,60%)]/50 hover:shadow-md transition-all flex items-center gap-4">
            <div className="p-3 rounded-lg bg-muted"><link.icon className="h-5 w-5 text-muted-foreground" /></div>
            <div>
              <p className="font-medium text-foreground">{link.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent Invoices</h2>
          <Link href="/billing/invoices" className="text-xs text-[hsl(246,80%,60%)] hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {[
              { date: 'Oct 1, 2026', amount: '$299.00', status: 'Paid', id: '#1048' },
              { date: 'Sep 1, 2026', amount: '$299.00', status: 'Paid', id: '#1047' },
              { date: 'Aug 1, 2026', amount: '$299.00', status: 'Paid', id: '#1046' },
            ].map((inv) => (
              <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 text-muted-foreground">{inv.date}</td>
                <td className="px-5 py-3 text-muted-foreground">{inv.id}</td>
                <td className="px-5 py-3 font-medium">{inv.amount}</td>
                <td className="px-5 py-3"><span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">{inv.status}</span></td>
                <td className="px-5 py-3 text-right"><Link href={`/billing/invoices/1`} className="text-xs text-[hsl(246,80%,60%)] hover:underline">Download PDF</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
