import { Plus, Target, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';

const leads = [
  { name: 'Acme Corp', contact: 'Tom Bradley', source: 'Website', score: 92, status: 'Hot', value: '$45,000' },
  { name: 'StartupXYZ', contact: 'Lisa Park', source: 'LinkedIn', score: 78, status: 'Warm', value: '$12,000' },
  { name: 'Global Inc', contact: 'Ray Gomez', source: 'Referral', score: 55, status: 'Cold', value: '$8,500' },
  { name: 'Tech Solutions', contact: 'Nina White', source: 'Webinar', score: 88, status: 'Hot', value: '$32,000' },
];

export default function LeadsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-description">1,842 active leads across all sources</p>
        </div>
        <Link href="/crm/leads/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Add Lead
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Hot Leads', value: '284', icon: TrendingUp, color: 'text-red-400' },
          { label: 'Avg Score', value: '72', icon: Star, color: 'text-yellow-400' },
          { label: 'Conversion Rate', value: '18.4%', icon: Target, color: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Source</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Score</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Est. Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((l) => (
              <tr key={l.name} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3"><Link href="/crm/leads/1" className="font-medium hover:text-[hsl(246,80%,60%)]">{l.name}</Link></td>
                <td className="px-4 py-3 text-muted-foreground">{l.contact}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[hsl(246,80%,60%)] rounded-full" style={{ width: `${l.score}%` }} />
                    </div>
                    <span className="text-xs font-medium">{l.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.status === 'Hot' ? 'bg-red-500/10 text-red-500' : l.status === 'Warm' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-400'}`}>{l.status}</span>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{l.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
