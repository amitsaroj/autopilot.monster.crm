import { Plus, DollarSign, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';

const deals = [
  { name: 'Enterprise License', company: 'TechCorp', stage: 'Proposal', value: '$48,000', probability: 70, owner: 'SJ', close: 'Oct 31' },
  { name: 'Support Package', company: 'Acme Ltd', stage: 'Negotiation', value: '$15,500', probability: 85, owner: 'MC', close: 'Nov 15' },
  { name: 'Starter Plan', company: 'StartupXYZ', stage: 'Qualification', value: '$3,200', probability: 40, owner: 'ED', close: 'Dec 1' },
  { name: 'CRM Migration', company: 'GlobalInc', stage: 'Closed Won', value: '$92,000', probability: 100, owner: 'JW', close: 'Done' },
];

export default function DealsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deals</h1>
          <p className="page-description">$284,500 pipeline value · 284 open deals</p>
        </div>
        <Link href="/crm/deals/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> New Deal
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pipeline Value', value: '$284,500', icon: DollarSign, color: 'text-green-400' },
          { label: 'Win Rate', value: '34%', icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Avg Deal Size', value: '$18,200', icon: Target, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deal</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Value</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Probability</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Close Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deals.map((d) => (
              <tr key={d.name} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3"><Link href="/crm/deals/1" className="font-medium hover:text-[hsl(246,80%,60%)]">{d.name}</Link></td>
                <td className="px-4 py-3 text-muted-foreground">{d.company}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    d.stage === 'Closed Won' ? 'bg-green-500/10 text-green-500' :
                    d.stage === 'Negotiation' ? 'bg-orange-500/10 text-orange-500' :
                    d.stage === 'Proposal' ? 'bg-blue-500/10 text-blue-400' : 'bg-muted text-muted-foreground'
                  }`}>{d.stage}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">{d.value}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${d.probability === 100 ? 'bg-green-500' : 'bg-[hsl(246,80%,60%)]'}`} style={{ width: `${d.probability}%` }} />
                    </div>
                    <span className="text-xs">{d.probability}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{d.close}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
