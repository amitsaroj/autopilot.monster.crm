import { BarChart3, Users, TrendingUp, Target, Award, ArrowUpRight, RefreshCw } from 'lucide-react';

const reps = [
  { name: 'Amit Saroj', deals: 22, won: 8, quota: 80000, achieved: 68000, win_rate: '36%', avg_cycle: '18d' },
  { name: 'Priya Sharma', deals: 18, won: 6, quota: 60000, achieved: 52000, win_rate: '33%', avg_cycle: '22d' },
  { name: 'Alex Kim', deals: 14, won: 5, quota: 50000, achieved: 44000, win_rate: '36%', avg_cycle: '16d' },
  { name: 'Sarah Lee', deals: 15, won: 4, quota: 45000, achieved: 38000, win_rate: '27%', avg_cycle: '24d' },
];

export default function AnalyticsTeamPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Performance</h1>
          <p className="page-description">Per-rep metrics and quota attainment · Q4 2024</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><RefreshCw className="h-4 w-4" />Refresh</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Team Revenue', value: '$202k', icon: TrendingUp, up: true, color: 'text-green-400' },
          { label: 'Avg Quota Att.', value: '85%', icon: Target, up: true, color: 'text-[hsl(246,80%,60%)]' },
          { label: 'Open Deals', value: '69', icon: BarChart3, up: true, color: 'text-blue-400' },
          { label: 'Avg Win Rate', value: '33%', icon: Award, up: false, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${s.up ? 'text-green-500' : 'text-red-400'}`}>
              <ArrowUpRight className={`h-3 w-3 ${!s.up ? 'rotate-180' : ''}`} />{s.up ? '+' : '-'}5% vs last quarter
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Rep Performance Leaders</h2>
          <div className="flex gap-2">
            {['Q4 2024', 'Q3 2024', 'Q2 2024'].map((p, i) => (
              <button key={p} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${i === 0 ? 'bg-[hsl(246,80%,60%)] border-transparent text-white' : 'border-border hover:bg-muted text-muted-foreground'}`}>{p}</button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">#</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Rep</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Deals</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Won</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Win Rate</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Quota Attainment</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Avg Cycle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reps.map((r, i) => {
              const pct = Math.round((r.achieved / r.quota) * 100);
              return (
                <tr key={r.name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`text-sm font-bold ${i === 0 ? 'text-yellow-500' : 'text-muted-foreground'}`}>#{i + 1}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(246,80%,60%)]">{r.name[0]}</div>
                      <p className="font-medium text-foreground">{r.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{r.deals}</td>
                  <td className="px-5 py-4 text-green-500 font-semibold">{r.won}</td>
                  <td className="px-5 py-4 text-muted-foreground">{r.win_rate}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-24">
                        <div className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : 'bg-[hsl(246,80%,60%)]'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-foreground">{pct}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">${(r.achieved / 1000).toFixed(0)}k / ${(r.quota / 1000).toFixed(0)}k</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{r.avg_cycle}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
