'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Ban, Loader2, Pause, Phone, Play, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  voiceCampaignService,
  VoiceCampaign,
  VoiceCampaignStats,
  VoiceCampaignRecipient,
} from '@/services/voice-campaign.service';

const RECIPIENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  QUEUED: 'Queued',
  CALLING: 'Calling',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  NO_ANSWER: 'No answer',
  BUSY: 'Busy',
  RETRY_PENDING: 'Retry scheduled',
  SKIPPED: 'Skipped',
  CANCELLED: 'Cancelled',
};

const ACTIVE_CAMPAIGN_STATUSES = new Set(['RUNNING', 'PAUSED']);

export default function VoiceCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<VoiceCampaign | null>(null);
  const [stats, setStats] = useState<VoiceCampaignStats | null>(null);
  const [recipients, setRecipients] = useState<VoiceCampaignRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const [campaignRes, statsRes, recipientsRes] = await Promise.all([
        voiceCampaignService.get(id),
        voiceCampaignService.getStats(id),
        voiceCampaignService.listRecipients(id, { page: 1 }),
      ]);
      setCampaign(campaignRes.data.data);
      setStats(statsRes.data.data);
      setRecipients(recipientsRes.data.data.items ?? []);
    } catch {
      toast.error('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Live progress via polling (no push-based transport for campaign progress
  // exists in this app — the only websocket gateway is the voice/AI audio
  // bridge itself, not a UI event bus).
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (campaign?.status === 'RUNNING') {
      pollRef.current = setInterval(() => void load(), 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [campaign?.status, load]);

  const runAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
    failureMessage: string,
  ) => {
    setActing(true);
    try {
      await action();
      toast.success(successMessage);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || failureMessage);
    } finally {
      setActing(false);
    }
  };

  const handleStart = () =>
    runAction(() => voiceCampaignService.start(id), 'Campaign started', 'Failed to start campaign');
  const handlePause = () =>
    runAction(() => voiceCampaignService.pause(id), 'Campaign paused', 'Failed to pause campaign');
  const handleResume = () =>
    runAction(() => voiceCampaignService.resume(id), 'Campaign resumed', 'Failed to resume campaign');
  const handleCancel = () =>
    runAction(() => voiceCampaignService.cancel(id), 'Campaign stopped', 'Failed to stop campaign');

  const handleRetryRecipient = (recipientId: string) =>
    runAction(
      () => voiceCampaignService.retryRecipient(id, recipientId),
      'Recipient queued for retry',
      'Failed to retry recipient',
    );
  const handleSkipRecipient = (recipientId: string) =>
    runAction(
      () => voiceCampaignService.skipRecipient(id, recipientId),
      'Recipient skipped',
      'Failed to skip recipient',
    );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-3xl py-8 text-center text-gray-500">Campaign not found.</div>
    );
  }

  const progressPct = campaign.totalContacts > 0 ? Math.min(100, Math.round((campaign.callsMade / campaign.totalContacts) * 100)) : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-8">
      <Link
        href="/voice/campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Campaigns
      </Link>

      <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-blue-100 p-3">
            <Phone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              From {campaign.fromNumber} · concurrency {campaign.concurrency}
              {campaign.callingHoursStart && campaign.callingHoursEnd
                ? ` · ${campaign.callingHoursStart}–${campaign.callingHoursEnd} ${campaign.timezone}`
                : ''}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-700">
          {campaign.status}
          {ACTIVE_CAMPAIGN_STATUSES.has(campaign.status) ? ' · live' : ''}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{campaign.callsMade} / {campaign.totalContacts}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total contacts', value: campaign.totalContacts },
          { label: 'Attempts made', value: campaign.callsMade },
          { label: 'Attempts answered', value: campaign.callsAnswered },
          { label: 'Attempts failed', value: campaign.callsFailed },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 -mt-3">
        Attempt counts include retries — see the recipient breakdown below for unique outcomes per
        contact.
      </p>

      {stats && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Recipient breakdown</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Object.entries(RECIPIENT_STATUS_LABELS).map(([key, label]) => (
              <div key={key} className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{stats.byStatus[key as never] ?? 0}</p>
                <p className="text-[11px] text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Call script</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
          {campaign.script || '(Using AI agent prompt instead of a script)'}
        </p>
      </div>

      <div className="flex gap-3">
        {campaign.status === 'DRAFT' && (
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={acting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            Start
          </button>
        )}
        {campaign.status === 'RUNNING' && (
          <button
            type="button"
            onClick={() => void handlePause()}
            disabled={acting}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
        )}
        {campaign.status === 'PAUSED' && (
          <button
            type="button"
            onClick={() => void handleResume()}
            disabled={acting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Resume
          </button>
        )}
        {(campaign.status === 'RUNNING' || campaign.status === 'PAUSED' || campaign.status === 'DRAFT') && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Stop this campaign? Pending and in-progress recipients will be cancelled. This cannot be undone.')) {
                void handleCancel();
              }
            }}
            disabled={acting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Ban className="h-4 w-4" />
            Stop
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-900">Recipients</h2>
        </div>
        {recipients.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">No recipients yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Phone</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Attempts</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Outcome</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Next attempt</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recipients.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-gray-900">{r.phone}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {RECIPIENT_STATUS_LABELS[r.status] ?? r.status}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {r.attempts}/{r.maxAttempts}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{r.outcome ?? '—'}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {r.nextAttemptAt ? new Date(r.nextAttemptAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      {['FAILED', 'NO_ANSWER', 'BUSY', 'SKIPPED', 'CANCELLED'].includes(r.status) && (
                        <button
                          type="button"
                          onClick={() => void handleRetryRecipient(r.id)}
                          disabled={acting}
                          className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                        >
                          Retry
                        </button>
                      )}
                      {['PENDING', 'RETRY_PENDING'].includes(r.status) && (
                        <button
                          type="button"
                          onClick={() => void handleSkipRecipient(r.id)}
                          disabled={acting}
                          className="text-xs font-medium text-gray-500 hover:underline disabled:opacity-50"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
