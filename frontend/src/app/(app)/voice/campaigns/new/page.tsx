'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { voiceCampaignService } from '@/services/voice-campaign.service';
import { crmMetadataService, type CrmSegment } from '@/services/crm-metadata.service';

export default function NewVoiceCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [segments, setSegments] = useState<CrmSegment[]>([]);
  const [form, setForm] = useState({
    name: '',
    fromNumber: '',
    script: '',
    contactListId: '',
  });

  useEffect(() => {
    crmMetadataService
      .getSegments()
      .then((res) => setSegments(res.data.data ?? []))
      .catch(() => toast.error('Failed to load contact lists'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactListId) {
      toast.error('Select a contact list (segment)');
      return;
    }
    setSaving(true);
    try {
      const res = await voiceCampaignService.create({
        name: form.name,
        fromNumber: form.fromNumber,
        script: form.script,
        contactListId: form.contactListId,
      });
      toast.success('Campaign created');
      router.push(`/voice/campaigns/${res.data.data.id}`);
    } catch {
      toast.error('Failed to create campaign');
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
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">From Number</label>
          <input
            value={form.fromNumber}
            onChange={(e) => setForm({ ...form, fromNumber: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            required
          />
        </div>
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
        </div>
        <div>
          <label className="text-sm font-medium">Script</label>
          <textarea
            value={form.script}
            onChange={(e) => setForm({ ...form, script: e.target.value })}
            rows={5}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{' '}
          Create
        </button>
      </form>
    </div>
  );
}
