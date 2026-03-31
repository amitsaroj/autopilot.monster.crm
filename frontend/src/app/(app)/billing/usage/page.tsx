import { DollarSign, TrendingUp, BarChart3, ArrowUpRight, Clock } from 'lucide-react';

const billingEvents = [
  { desc: 'Contact import — 284 records processed', unit: 'contacts', usage: 284, cost: '$0.00', date: 'Oct 10' },
  { desc: 'Outbound calls — 48 minutes used', unit: 'call minutes', usage: 48, cost: '$4.80', date: 'Oct 10' },
  { desc: 'AI chat messages — 840 messages', unit: 'messages', usage: 840, cost: '$8.40', date: 'Oct 9' },
  { desc: 'WhatsApp broadcast — 1,200 messages sent', unit: 'messages', usage: 1200, cost: '$12.00', date: 'Oct 8' },
  { desc: 'Email sends — 3,480 transactional', unit: 'emails', usage: 3480, cost: '$0.00', date: 'Oct 7' },
];

export default function BillingUsagePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usage History</h1>
          <p className="page-description">Detailed usage billing breakdown · October 2024</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Usage This Month', value: '$25.20', icon: DollarSign, color: 'text-[hsl(246,80%,60%)]' },
          { label: 'Base Plan', value: '$960.00', icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Projected Total', value: '$985.20', icon: BarChart3, color: 'text-green-400' },
          { label: 'Billing On', value: 'Nov 1, 2024', icon: Clock, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h2 className="text-sm font-semibold">Usage Events</h2></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Units Used</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Cost</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {billingEvents.map((e, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4 text-sm text-foreground">{e.desc}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{e.usage.toLocaleString()} {e.unit}</td>
                <td className="px-5 py-4 font-semibold text-foreground">{e.cost}</td>
                <td className="px-5 py-4 text-xs text-muted-foreground">{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-4 border-t border-border bg-muted/20 flex justify-between items-center">
          <span className="text-sm text-muted-foreground font-medium">October Usage Total</span>
          <span className="text-sm font-bold text-foreground">$25.20</span>
        </div>
      </div>
    </div>
  );
}
