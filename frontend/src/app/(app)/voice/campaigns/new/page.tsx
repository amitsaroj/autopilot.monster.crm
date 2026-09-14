'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { voiceCampaignService } from '@/services/voice-campaign.service';
import { crmMetadataService, type CrmSegment } from '@/services/crm-metadata.service';
import { agentService, type Agent } from '@/services/agent.service';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
];

export default function NewVoiceCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [segments, setSegments] = useState<CrmSegment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState({
    name: '',
    fromNumber: '',
    script: '',
    contactListId: '',
    agentId: '',
    concurrency: 3,
    maxAttempts: 1,
    retryDelayMinutes: 30,
    callingHoursStart: '',
    callingHoursEnd: '',
    timezone: 'UTC',
  });

  useEffect(() => {
    crmMetadataService
      .getSegments()
      .then((res) => setSegments(res.data.data ?? []))
      .catch(() => toast.error('Failed to load contact lists'));
    agentService
      .getAgents()
      .then((res: any) => setAgents(res.data?.data ?? res.data ?? []))
      .catch(() => undefined);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactListId) {
      toast.error('Select a contact list (segment)');
      return;
    }
    if ((form.callingHoursStart && !form.callingHoursEnd) || (!form.callingHoursStart && form.callingHoursEnd)) {
      toast.error('Set both a start and end calling-hours time, or leave both blank');
      return;
    }
    setSaving(true);
    try {
      const res = await voiceCampaignService.create({
        name: form.name,
        fromNumber: form.fromNumber,
        script: form.script,
        contactListId: form.contactListId,
        agentId: form.agentId || undefined,
        concurrency: form.concurrency,
        maxAttempts: form.maxAttempts,
        retryDelayMinutes: form.retryDelayMinutes,
        callingHoursStart: form.callingHoursStart || undefined,
        callingHoursEnd: form.callingHoursEnd || undefined,
        timezone: form.timezone,
      });
      toast.success('Campaign created');
      router.push(`/voice/campaigns/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link
        href="/voice/campaigns"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Campaigns
      </Link>
      <h1 className="text-2xl font-bold">New Voice Campaign</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Basic information
          </h2>
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">From Number</label>
            <input
              value={form.fromNumber}
              onChange={(e) => setForm({ ...form, fromNumber: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              placeholder="+15551234567"
              required
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Audience
          </h2>
          <div>
            <label className="text-sm font-medium">Contact list (segment)</label>
            <select
              value={form.contactListId}
              onChange={(e) => setForm({ ...form, contactListId: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              required
            >
              <option value="">Select segment…</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Contacts marked do-not-contact or without a valid phone number are skipped automatically.
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            AI conversation
          </h2>
          <div>
            <label className="text-sm font-medium">AI agent (optional)</label>
            <select
              value={form.agentId}
              onChange={(e) => setForm({ ...form, agentId: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
            >
              <option value="">Use script below instead</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              When set, the agent&apos;s configured prompt and voice drive the call instead of the
              script.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Script</label>
            <textarea
              value={form.script}
              onChange={(e) => setForm({ ...form, script: e.target.value })}
              rows={5}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              placeholder="What should the AI agent say and try to accomplish on this call?"
              required
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Calling configuration
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Concurrency</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.concurrency}
                onChange={(e) => setForm({ ...form, concurrency: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              />
              <p className="mt-1 text-xs text-muted-foreground">Max simultaneous active calls.</p>
            </div>
            <div>
              <label className="text-sm font-medium">Max attempts</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.maxAttempts}
                onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              />
              <p className="mt-1 text-xs text-muted-foreground">1 = no retry on busy/no-answer.</p>
            </div>
            <div>
              <label className="text-sm font-medium">Retry delay (minutes)</label>
              <input
                type="number"
                min={1}
                max={1440}
                value={form.retryDelayMinutes}
                onChange={(e) => setForm({ ...form, retryDelayMinutes: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
                disabled={form.maxAttempts <= 1}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Timezone</label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Calling hours start</label>
              <input
                type="time"
                value={form.callingHoursStart}
                onChange={(e) => setForm({ ...form, callingHoursStart: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Calling hours end</label>
              <input
                type="time"
                value={form.callingHoursEnd}
                onChange={(e) => setForm({ ...form, callingHoursEnd: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave calling hours blank to allow calls at any time. Retries that would land outside the
            window are pushed to the next window instead of being dropped.
          </p>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{' '}
          Create Campaign
        </button>
      </form>
    </div>
  );
}
