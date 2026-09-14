'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { whatsappBroadcastService } from '@/services/whatsapp-broadcast.service';
import { whatsappTemplateService, WhatsappTemplate } from '@/services/whatsapp-template.service';
import { crmMetadataService, type CrmSegment } from '@/services/crm-metadata.service';

type AudienceMode = 'all' | 'segment' | 'tags';

export default function NewWhatsappBroadcastPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [segments, setSegments] = useState<CrmSegment[]>([]);
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('all');
  const [segmentId, setSegmentId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void whatsappTemplateService.list().then((r) => setTemplates(r.data.data ?? []));
    void crmMetadataService
      .getSegments()
      .then((r) => setSegments(r.data.data ?? []))
      .catch(() => undefined);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (audienceMode === 'segment' && !segmentId) {
      toast.error('Select a segment');
      return;
    }
    if (audienceMode === 'tags' && !tagsInput.trim()) {
      toast.error('Enter at least one tag');
      return;
    }
    setSaving(true);
    try {
      const contactFilter =
        audienceMode === 'segment'
          ? { segmentIds: [segmentId] }
          : audienceMode === 'tags'
            ? { tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean) }
            : undefined;
      const res = await whatsappBroadcastService.create({ name, templateId, contactFilter });
      await whatsappBroadcastService.send(res.data.data.id);
      toast.success('Broadcast started');
      router.push('/whatsapp/broadcast');
    } catch {
      toast.error('Failed to create broadcast');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link
        href="/whatsapp/broadcast"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Broadcasts
      </Link>
      <h1 className="text-2xl font-bold">New Broadcast</h1>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Template</label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            required
          >
            <option value="">Select template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Audience</label>
          <select
            value={audienceMode}
            onChange={(e) => setAudienceMode(e.target.value as AudienceMode)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
          >
            <option value="all">All contacts</option>
            <option value="segment">By segment</option>
            <option value="tags">By tags</option>
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {audienceMode === 'all'
              ? 'Every contact with a phone number will receive this broadcast.'
              : audienceMode === 'segment'
                ? 'Only contacts in the selected segment will receive this broadcast.'
                : 'Only contacts matching at least one of the tags below will receive this broadcast.'}
          </p>
        </div>
        {audienceMode === 'segment' && (
          <div>
            <label className="text-sm font-medium">Segment</label>
            <select
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
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
        )}
        {audienceMode === 'tags' && (
          <div>
            <label className="text-sm font-medium">Tags</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="vip, newsletter"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">Comma-separated.</p>
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{' '}
          Send Broadcast
        </button>
      </form>
    </div>
  );
}
