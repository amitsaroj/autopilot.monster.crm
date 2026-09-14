'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Plus,
  Search,
  Loader2,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  FileEdit,
  Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { voiceCampaignService, VoiceCampaign } from '@/services/voice-campaign.service';

const STATUS_STYLES: Record<VoiceCampaign['status'], { label: string; className: string; icon: typeof Phone }> = {
  DRAFT: { label: 'Draft', className: 'text-muted-foreground bg-muted', icon: FileEdit },
  RUNNING: { label: 'Running', className: 'text-green-500 bg-green-500/10', icon: PlayCircle },
  PAUSED: { label: 'Paused', className: 'text-amber-500 bg-amber-500/10', icon: PauseCircle },
  COMPLETED: { label: 'Completed', className: 'text-blue-400 bg-blue-400/10', icon: CheckCircle2 },
  STOPPED: { label: 'Stopped', className: 'text-red-400 bg-red-400/10', icon: Ban },
};

export default function VoiceCampaignsPage() {
  const [campaigns, setCampaigns] = useState<VoiceCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    void voiceCampaignService
      .list()
      .then((res) => setCampaigns(res.data.data ?? []))
      .catch(() => toast.error('Failed to load campaigns'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const running = campaigns.filter((c) => c.status === 'RUNNING').length;
  const paused = campaigns.filter((c) => c.status === 'PAUSED').length;
  const completed = campaigns.filter((c) => c.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bulk Voice Campaigns</h1>
          <p className="page-description">
            Autonomous outbound calling across a contact list, powered by the AI voice engine
          </p>
        </div>
        <Link
          href="/voice/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns', value: String(campaigns.length), icon: Phone },
          { label: 'Running', value: String(running), icon: PlayCircle },
          { label: 'Paused', value: String(paused), icon: PauseCircle },
          { label: 'Completed', value: String(completed), icon: CheckCircle2 },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-lg bg-muted text-[hsl(246,80%,60%)]">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search campaigns..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {campaigns.length === 0 ? (
              <>
                No campaigns yet.{' '}
                <Link href="/voice/campaigns/new" className="text-[hsl(246,80%,60%)] hover:underline">
                  Create one to get started.
                </Link>
              </>
            ) : (
              'No campaigns match your search.'
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Campaign</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Progress</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Answered</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((campaign) => {
                const status = STATUS_STYLES[campaign.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={campaign.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/voice/campaigns/${campaign.id}`}
                        className="font-medium text-foreground hover:text-[hsl(246,80%,60%)]"
                      >
                        {campaign.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{campaign.fromNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {campaign.callsMade} / {campaign.totalContacts || 0}
                    </td>
                    <td className="px-4 py-3 text-green-500">{campaign.callsAnswered}</td>
                    <td className="px-4 py-3 text-red-400">{campaign.callsFailed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
