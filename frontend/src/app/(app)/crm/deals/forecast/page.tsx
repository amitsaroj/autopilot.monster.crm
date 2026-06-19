'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Target, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { forecastService, ForecastSummary } from '@/services/forecast.service';

const stageColor: Record<string, string> = {
  Prospecting: 'bg-muted text-muted-foreground',
  Qualification: 'bg-blue-500/10 text-blue-400',
  Proposal: 'bg-yellow-500/10 text-yellow-500',
  Negotiation: 'bg-orange-500/10 text-orange-400',
  Closing: 'bg-green-500/10 text-green-500',
  Won: 'bg-green-500/10 text-green-500',
};

export default function DealForecastPage() {
  const [forecast, setForecast] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    forecastService
      .getForecast()
      .then((response) => setForecast(response.data.data))
      .catch(() => setError('Unable to load forecast data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !forecast) {
    return <div className="p-6 text-destructive">{error ?? 'No forecast data available'}</div>;
  }

  const quota = Math.max(forecast.totalForecast * 1.5, 120000);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deal Revenue Forecast</h1>
          <p className="page-description">Weighted pipeline by deal stage</p>
        </div>
        <Link href="/crm/deals" className="text-sm text-[hsl(246,80%,60%)] hover:underline">
          View deals
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pipeline', value: `$${(forecast.totalPipeline / 1000).toFixed(1)}k`, icon: DollarSign },
          { label: 'Weighted Forecast', value: `$${(forecast.totalForecast / 1000).toFixed(1)}k`, icon: TrendingUp },
          { label: 'On Track', value: String(forecast.onTrackCount), icon: Target },
          { label: 'At Risk', value: String(forecast.atRiskCount), icon: AlertCircle },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <stat.icon className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-3">Deal</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3 text-right">Forecast</th>
            </tr>
          </thead>
          <tbody>
            {forecast.deals.map((deal) => (
              <tr key={deal.id} className="border-t border-border">
                <td className="px-4 py-3">{deal.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${stageColor[deal.stageName] ?? 'bg-muted'}`}>
                    {deal.stageName}
                  </span>
                </td>
                <td className="px-4 py-3">{deal.currency} {deal.value.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{deal.currency} {deal.forecastedValue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Quota target: {forecast.currency} {quota.toLocaleString()}
      </p>
    </div>
  );
}
