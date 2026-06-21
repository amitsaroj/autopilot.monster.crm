'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Target, AlertCircle } from 'lucide-react';

import { forecastService, ForecastSummary } from '@/services/forecast.service';

const stageColor: Record<string, string> = {
  Prospecting: 'bg-muted text-muted-foreground',
  Qualification: 'bg-blue-500/10 text-blue-400',
  Proposal: 'bg-yellow-500/10 text-yellow-500',
  Negotiation: 'bg-orange-500/10 text-orange-400',
  Closing: 'bg-green-500/10 text-green-500',
  Won: 'bg-green-500/10 text-green-500',
};

export default function CrmForecastPage() {
  const [forecast, setForecast] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    forecastService
      .getForecast()
      .then((response) => {
        setForecast(response.data.data);
      })
      .catch(() => {
        setError('Unable to load forecast data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading forecast...</div>;
  }

  if (error || !forecast) {
    return <div className="p-6 text-destructive">{error ?? 'No forecast data available'}</div>;
  }

  const deals = forecast.deals;
  const quota = Math.max(forecast.totalForecast * 1.5, 120000);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Revenue Forecast</h1>
          <p className="page-description">Weighted pipeline forecast · {forecast.currency}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Total Pipeline',
            value: `$${(forecast.totalPipeline / 1000).toFixed(1)}k`,
            sub: `${forecast.dealCount} deals`,
            icon: DollarSign,
            color: 'text-blue-400',
          },
          {
            label: 'Forecasted (Weighted)',
            value: `$${(forecast.totalForecast / 1000).toFixed(1)}k`,
            sub: 'Expected close',
            icon: TrendingUp,
            color: 'text-[hsl(246,80%,60%)]',
          },
          {
            label: 'On Track',
            value: String(forecast.onTrackCount),
            sub: '≥ 50% probability',
            icon: Target,
            color: 'text-green-400',
          },
          {
            label: 'At Risk',
            value: String(forecast.atRiskCount),
            sub: '< 30% probability',
            icon: AlertCircle,
            color: 'text-yellow-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Forecast vs Quota</h2>
          <span className="text-xs text-muted-foreground">Quota: ${quota.toLocaleString()}</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min((forecast.totalForecast / quota) * 100, 100)}%`,
              background: 'hsl(246,80%,60%)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$0</span>
          <span className="font-semibold text-[hsl(246,80%,60%)]">
            ${(forecast.totalForecast / 1000).toFixed(1)}k forecasted (
            {((forecast.totalForecast / quota) * 100).toFixed(0)}%)
          </span>
          <span>${(quota / 1000).toFixed(0)}k</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Deal Breakdown</h2>
        </div>
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
            {deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{deal.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{deal.ownerName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      stageColor[deal.stageName] ?? 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {deal.stageName}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">
                  ${deal.value.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={deal.probability >= 50 ? 'text-green-500' : 'text-yellow-500'}>
                    {deal.probability}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-[hsl(246,80%,60%)]">
                  ${deal.forecastedValue.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {deal.expectedCloseDate ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
