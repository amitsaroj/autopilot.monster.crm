'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Pause, Phone, Play } from 'lucide-react';
import toast from 'react-hot-toast';

import { voiceCampaignService, VoiceCampaign } from '@/services/voice-campaign.service';

export default function VoiceCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<VoiceCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await voiceCampaignService.get(id);
      setCampaign(res.data.data);
    } catch {
      toast.error('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const handleStart = async () => {
    setActing(true);
    try {
      await voiceCampaignService.start(id);
      toast.success('Campaign started');
      await load();
    } catch {
      toast.error('Failed to start campaign');
    } finally {
      setActing(false);
    }
  };

  const handlePause = async () => {
    setActing(true);
    try {
      await voiceCampaignService.pause(id);
      toast.success('Campaign paused');
      await load();
    } catch {
      toast.error('Failed to pause campaign');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-3xl py-8 text-center text-gray-500">
        Campaign not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
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
            <p className="mt-1 text-sm text-gray-500">From {campaign.fromNumber}</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-700">
          {campaign.status}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total contacts', value: campaign.totalContacts },
          { label: 'Calls made', value: campaign.callsMade },
          { label: 'Answered', value: campaign.callsAnswered },
          { label: 'Failed', value: campaign.callsFailed },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Call script</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
          {campaign.script}
        </p>
      </div>

      <div className="flex gap-3">
        {campaign.status !== 'RUNNING' && (
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
      </div>
    </div>
  );
}
