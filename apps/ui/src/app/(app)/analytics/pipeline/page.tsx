import { BarChart3, TrendingUp, Target, Users, ArrowUpRight, RefreshCw } from 'lucide-react';

const stages = [
  { name: 'Prospecting', count: 28, value: '$142k', conv: '—', color: 'bg-slate-500' },
  { name: 'Qualification', count: 18, value: '$96k', conv: '64%', color: 'bg-blue-500' },
  { name: 'Proposal', count: 12, value: '$72k', conv: '67%', color: 'bg-yellow-500' },
  { name: 'Negotiation', count: 7, value: '$56k', conv: '58%', color: 'bg-orange-500' },
  { name: 'Closing', count: 4, value: '$38k', conv: '57%', color: 'bg-green-500' },
];

export default function AnalyticsPipelinePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pipeline Analytics</h1>
          <p className="page-description">Stage conversion funnels and pipeline health</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><RefreshCw className="h-4 w-4" />Refresh</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Pipeline', value: '$404k', icon: BarChart3, color: 'text-[hsl(246,80%,60%)]', up: true },
          { label: 'Deals in Pipeline', value: '69', icon: Target, color: 'text-blue-400', up: true },
          { label: 'Avg Deal Size', value: '$5.9k', icon: TrendingUp, color: 'text-green-400', up: true },
          { label: 'Win Rate', value: '31%', icon: Users, color: 'text-yellow-400', up: true },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-green-500 flex items-center gap-0.5 mt-1"><ArrowUpRight className="h-3 w-3" />+8% vs last month</p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold mb-5">Conversion Funnel</h2>
        <div className="space-y-3">
          {stages.map((s, i) => {
            const width = 100 - i * 14;
            return (
              <div key={s.name} className="flex items-center gap-4">
                <div className="w-28 text-xs text-right text-muted-foreground shrink-0">{s.name}</div>
                <div className="flex-1 relative">
                  <div className="h-9 bg-muted rounded-lg overflow-hidden">
                    <div className={`h-full rounded-lg ${s.color} opacity-80 flex items-center px-3`} style={{ width: `${width}%` }}>
                      <span className="text-xs text-white font-semibold">{s.count} deals · {s.value}</span>
                    </div>
                  </div>
                </div>
                <div className="w-14 text-xs text-muted-foreground shrink-0">{s.conv !== '—' ? <span className="text-green-500 font-bold">{s.conv}</span> : '—'}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>Conversion rates show stage-to-stage progression</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Pipeline by Owner</h2>
          <div className="space-y-3">
            {[
              { name: 'Amit Saroj', deals: 22, value: '$132k', percent: 73 },
              { name: 'Priya Sharma', deals: 18, value: '$96k', percent: 53 },
              { name: 'Alex Kim', deals: 14, value: '$84k', percent: 47 },
              { name: 'Sarah Lee', deals: 15, value: '$92k', percent: 51 },
            ].map((o) => (
              <div key={o.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{o.name} <span className="text-foreground font-medium">({o.deals} deals)</span></span>
                  <span className="font-semibold text-foreground">{o.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[hsl(246,80%,60%)]" style={{ width: `${o.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Deal Age Distribution</h2>
          <div className="space-y-3">
            {[
              { label: '< 7 days', count: 18, color: 'bg-green-500' },
              { label: '7–14 days', count: 24, color: 'bg-yellow-500' },
              { label: '14–30 days', count: 19, color: 'bg-orange-500' },
              { label: '> 30 days', count: 8, color: 'bg-red-500' },
            ].map((a) => (
              <div key={a.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 shrink-0">{a.label}</span>
                <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                  <div className={`h-full rounded ${a.color} opacity-70`} style={{ width: `${(a.count / 24) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-foreground w-6 shrink-0 text-right">{a.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
