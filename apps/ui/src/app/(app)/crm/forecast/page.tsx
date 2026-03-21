import { DollarSign, TrendingUp, Target, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

const deals = [
  { name: 'TechCorp Enterprise License', owner: 'Amit', stage: 'Negotiation', value: 48000, probability: 70, forecastedValue: 33600, closeDate: 'Oct 31' },
  { name: 'GlobalManufacturing Phase 2', owner: 'Priya', stage: 'Proposal', value: 32000, probability: 50, forecastedValue: 16000, closeDate: 'Nov 15' },
  { name: 'Acme Solutions Bundle', owner: 'Alex', stage: 'Qualification', value: 14400, probability: 30, forecastedValue: 4320, closeDate: 'Dec 5' },
  { name: 'HealthFirst Annual Renewal', owner: 'Sarah', stage: 'Closing', value: 28000, probability: 85, forecastedValue: 23800, closeDate: 'Oct 28' },
  { name: 'RetailHoldings Pilot', owner: 'Amit', stage: 'Prospecting', value: 9600, probability: 15, forecastedValue: 1440, closeDate: 'Dec 30' },
];

const stageColor: Record<string, string> = {
  Prospecting: 'bg-muted text-muted-foreground',
  Qualification: 'bg-blue-500/10 text-blue-400',
  Proposal: 'bg-yellow-500/10 text-yellow-500',
  Negotiation: 'bg-orange-500/10 text-orange-400',
  Closing: 'bg-green-500/10 text-green-500',
};

const totalForecast = deals.reduce((s, d) => s + d.forecastedValue, 0);
const totalPipeline = deals.reduce((s, d) => s + d.value, 0);

export default function CrmForecastPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Revenue Forecast</h1>
          <p className="page-description">Q4 2024 · Weighted pipeline forecast</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Pipeline', value: `$${(totalPipeline / 1000).toFixed(0)}k`, sub: '5 deals', icon: DollarSign, color: 'text-blue-400' },
          { label: 'Forecasted (Weighted)', value: `$${(totalForecast / 1000).toFixed(1)}k`, sub: 'Expected close', icon: TrendingUp, color: 'text-[hsl(246,80%,60%)]' },
          { label: 'On Track', value: '3', sub: '≥ 50% probability', icon: Target, color: 'text-green-400' },
          { label: 'At Risk', value: '2', sub: '< 30% probability', icon: AlertCircle, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Forecast bar */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Q4 Forecast vs Quota</h2>
          <span className="text-xs text-muted-foreground">Quota: $120,000</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full" style={{ width: `${(totalForecast / 120000) * 100}%`, background: 'hsl(246,80%,60%)' }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$0</span>
          <span className="font-semibold text-[hsl(246,80%,60%)]">${(totalForecast / 1000).toFixed(1)}k forecasted ({((totalForecast / 120000) * 100).toFixed(0)}%)</span>
          <span>$120k</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border"><h2 className="text-sm font-semibold">Deal Breakdown</h2></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deal</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Owner</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stage</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Value</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Probability</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Forecast</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Close</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deals.map((d) => (
              <tr key={d.name} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.owner}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stageColor[d.stage]}`}>{d.stage}</span></td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">${d.value.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={d.probability >= 50 ? 'text-green-500' : 'text-yellow-500'}>{d.probability}%</span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-[hsl(246,80%,60%)]">${d.forecastedValue.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.closeDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
