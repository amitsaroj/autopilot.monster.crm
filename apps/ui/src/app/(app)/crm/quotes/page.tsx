import { FileText, Plus, Search, Filter, Download, Send, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';

const quotes = [
  { id: 'QT-2024-001', deal: 'Enterprise License', client: 'TechCorp Inc', total: '$48,000', created: 'Oct 1', valid: 'Oct 31', status: 'Sent' },
  { id: 'QT-2024-002', deal: 'CRM Pro Bundle', client: 'Acme Solutions', total: '$14,400', created: 'Sep 28', valid: 'Oct 28', status: 'Draft' },
  { id: 'QT-2024-003', deal: 'Basic Onboarding', client: 'StartupXYZ', total: '$7,200', created: 'Sep 20', valid: 'Oct 20', status: 'Accepted' },
  { id: 'QT-2024-004', deal: 'Healthcare Package', client: 'HealthFirst', total: '$28,000', created: 'Sep 15', valid: 'Oct 15', status: 'Expired' },
];

const statusStyle: Record<string, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Sent: 'bg-blue-500/10 text-blue-400',
  Accepted: 'bg-green-500/10 text-green-500',
  Expired: 'bg-red-500/10 text-red-400',
};

const statusIcon: Record<string, typeof Clock> = {
  Draft: Clock, Sent: Send, Accepted: CheckCircle, Expired: XCircle,
};

export default function QuotesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotes</h1>
          <p className="page-description">Proposals & quotes sent to prospects</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Download className="h-4 w-4" />Export</button>
          <Link href="/crm/quotes/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> New Quote
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Value', value: '$97.6k', color: 'bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]' },
          { label: 'Accepted', value: '$7.2k', color: 'bg-green-500/10 text-green-500' },
          { label: 'Pending', value: '$62.4k', color: 'bg-blue-500/10 text-blue-400' },
          { label: 'Conversion Rate', value: '25%', color: 'bg-yellow-500/10 text-yellow-500' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold px-2 py-0.5 rounded-lg inline-block ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search quotes..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Filter className="h-4 w-4" />Filter</button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quote #</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deal</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Valid Until</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotes.map((q) => {
              const StatusIco = statusIcon[q.status];
              return (
                <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />
                      <Link href={`/crm/quotes/${q.id}`} className="font-mono text-xs font-semibold text-[hsl(246,80%,60%)] hover:underline">{q.id}</Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{q.deal}</td>
                  <td className="px-4 py-3 text-muted-foreground">{q.client}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{q.total}</td>
                  <td className="px-4 py-3 text-muted-foreground">{q.created}</td>
                  <td className="px-4 py-3 text-muted-foreground">{q.valid}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusStyle[q.status]}`}>
                      <StatusIco className="h-3 w-3" />{q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/crm/quotes/${q.id}`} className="p-1.5 rounded hover:bg-muted transition-colors"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Link>
                      <Link href={`/crm/quotes/${q.id}/send`} className="p-1.5 rounded hover:bg-muted transition-colors"><Send className="h-3.5 w-3.5 text-muted-foreground" /></Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
