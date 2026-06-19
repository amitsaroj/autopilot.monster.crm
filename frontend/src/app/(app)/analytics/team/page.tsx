'use client';

import { useEffect, useState } from 'react';
import { Loader2, BarChart3, TrendingUp, Target, Award, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { analyticsService, TeamMemberAnalytics } from '@/services/analytics.service';

export default function AnalyticsTeamPage() {
  const [members, setMembers] = useState<TeamMemberAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setMembers((await analyticsService.getTeam()) ?? []);
    } catch {
      toast.error('Failed to load team analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const totalRevenue = members.reduce((sum, member) => sum + member.value, 0);
  const totalDeals = members.reduce((sum, member) => sum + member.deals, 0);
  const avgWinRate =
    members.length > 0 ? members.reduce((sum, member) => sum + member.winRate, 0) / members.length : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Performance</h1>
          <p className="page-description">Per-rep deal metrics from live CRM data</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Team Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Total Deals', value: String(totalDeals), icon: BarChart3, color: 'text-blue-400' },
          { label: 'Team Members', value: String(members.length), icon: Target, color: 'text-[hsl(246,80%,60%)]' },
          { label: 'Avg Win Rate', value: `${avgWinRate.toFixed(1)}%`, icon: Award, color: 'text-yellow-400' },
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
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Rep Performance</h2>
        </div>
        {members.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">No team performance data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Owner</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Deals</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Won</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Win Rate</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Won Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.ownerId} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-foreground">{member.ownerId}</td>
                  <td className="px-5 py-4 text-muted-foreground">{member.deals}</td>
                  <td className="px-5 py-4 text-green-500 font-semibold">{member.won}</td>
                  <td className="px-5 py-4 text-muted-foreground">{member.winRate.toFixed(1)}%</td>
                  <td className="px-5 py-4 text-foreground">${member.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
