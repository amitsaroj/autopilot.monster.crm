import { TrendingUp, DollarSign, ArrowUpRight, Users, Target, BarChart3, RefreshCw } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const bars = [38, 42, 55, 49, 63, 71, 68, 74, 82, 90];

export default function AnalyticsRevenuePage() {
  const maxBar = Math.max(...bars);
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Revenue Analytics</h1>
          <p className="page-description">MRR, ARR, churn, and revenue trends</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><RefreshCw className="h-4 w-4" />Refresh</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: '$18,400', change: '+12%', icon: DollarSign, up: true },
          { label: 'ARR', value: '$220,800', change: '+12%', icon: TrendingUp, up: true },
          { label: 'Churn Rate', value: '2.4%', change: '-0.3%', icon: Users, up: false },
          { label: 'Avg Revenue / Account', value: '$3,680', change: '+8%', icon: Target, up: true },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${s.up ? 'text-green-500' : 'text-red-400'}`}>
              <ArrowUpRight className={`h-3 w-3 ${!s.up ? 'rotate-180' : ''}`} />{s.change} vs last month
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold">MRR Trend (2024)</h2>
          <div className="flex gap-2">
            {['3M', '6M', '1Y', 'All'].map((p, i) => (
              <button key={p} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${i === 2 ? 'bg-[hsl(246,80%,60%)] border-transparent text-white' : 'border-border hover:bg-muted text-muted-foreground'}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-[hsl(246,80%,60%)] opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${(h / maxBar) * 140}px` }}
                title={`$${h}k`}
              />
              <span className="text-xs text-muted-foreground">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Revenue by Plan</h2>
          <div className="space-y-3">
            {[
              { name: 'Enterprise', revenue: '$10,800', percent: 59, color: 'bg-[hsl(246,80%,60%)]' },
              { name: 'Professional', revenue: '$5,280', percent: 29, color: 'bg-blue-500' },
              { name: 'Starter', revenue: '$2,320', percent: 12, color: 'bg-green-500' },
            ].map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{p.name}</span>
                  <span className="font-semibold text-foreground">{p.revenue}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Cohort Retention (last 6 months)</h2>
          <div className="space-y-2">
            {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m, i) => {
              const ret = 100 - i * 3;
              return (
                <div key={m} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-muted-foreground text-right">{m}</span>
                  <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-green-500/60 rounded flex items-center px-2" style={{ width: `${ret}%` }}>
                      <span className="text-xs text-white font-medium">{ret}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
