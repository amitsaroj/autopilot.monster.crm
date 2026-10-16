'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  whatsappBroadcastService,
  type WhatsappBroadcast,
} from '@/services/whatsapp-broadcast.service';
import {
  whatsappTemplateService,
  type WhatsappTemplate,
} from '@/services/whatsapp-template.service';
import { whatsappAccountService } from '@/services/whatsapp-account.service';
import { crmMetadataService as crmService, type CrmSegment } from '@/services/crm-metadata.service';
import { parseApiData } from '@/lib/api/parse-response';
import { useResource } from '@/components/whatsapp/use-resource';
import {
  templateBody,
  templateParameterKeys,
  templateSendComponents,
  templateSendIssue,
} from '@/components/whatsapp/template-utils';
import {
  PageHeading,
  Notice,
  Field,
  inputClass,
  buttonClass,
  secondaryClass,
  panelClass,
  errorMessage,
} from '@/components/whatsapp/ui';
export default function NewBroadcastPage() {
  const router = useRouter();
  const templates = useResource(
    async () => parseApiData<WhatsappTemplate[]>(await whatsappTemplateService.list()) ?? [],
  );
  const accounts = useResource(whatsappAccountService.list);
  const segments = useResource(
    async () => parseApiData<CrmSegment[]>(await crmService.getSegments()) ?? [],
  );
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [audience, setAudience] = useState('all');
  const [tags, setTags] = useState('');
  const [excludeTags, setExcludeTags] = useState('');
  const [maxRecipients, setMaxRecipients] = useState('');
  const [capEnabled, setCapEnabled] = useState(false);
  const [maxMessages, setMaxMessages] = useState(1);
  const [windowHours, setWindowHours] = useState(24);
  const [segmentId, setSegmentId] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connected = accounts.data?.filter((a) => a.status === 'CONNECTED') ?? [];
  const selectedPhone = phoneId || (connected.length === 1 ? connected[0].phoneNumberId : '');
  const template = templates.data?.find((t) => t.id === templateId);
  const sendIssue = templateSendIssue(template);
  const keys = sendIssue ? [] : templateParameterKeys(template);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (sendIssue) {
      setError(sendIssue);
      return;
    }
    if (!selectedPhone) {
      setError('Select a connected sending number.');
      return;
    }
    setBusy(true);
    try {
      const res = await whatsappBroadcastService.create({
        name: name.trim(),
        templateId,
        phoneNumberId: selectedPhone,
        contactFilter: {
          ...(audience === 'tags'
            ? {
                tags: tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              }
            : audience === 'segment'
              ? { segmentIds: [segmentId] }
              : {}),
          excludeTags: excludeTags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          ...(maxRecipients ? { maxRecipients: Number(maxRecipients) } : {}),
          ...(capEnabled ? { frequencyCap: { maxMessages, windowHours } } : {}),
        },
        templateComponents: templateSendComponents(keys, values),
      });
      const b = parseApiData<WhatsappBroadcast>(res);
      if (!b) throw new Error('No draft returned');
      router.push(`/whatsapp/broadcast/${b.id}`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <PageHeading
        title="Prepare a broadcast"
        description="Save a draft first. Review recipient eligibility before scheduling or sending."
        action={
          <Link href="/whatsapp/broadcast" className={secondaryClass}>
            Back to broadcasts
          </Link>
        }
      />
      {error && <Notice error>{error}</Notice>}
      {(accounts.error || templates.error) && (
        <Notice error>{accounts.error || templates.error}</Notice>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={(e) => void save(e)} className={`${panelClass} space-y-4`}>
          <Field label="Broadcast name">
            <input
              required
              maxLength={255}
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Sending number">
            <select
              required
              className={inputClass}
              value={selectedPhone}
              onChange={(e) => setPhoneId(e.target.value)}
            >
              <option value="">Select connected account</option>
              {connected.map((a) => (
                <option key={a.id} value={a.phoneNumberId}>
                  {a.displayPhoneNumber || a.phoneNumberId}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Approved template">
            <select
              required
              className={inputClass}
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value);
                setValues({});
              }}
            >
              <option value="">Select approved Meta template</option>
              {templates.data
                ?.filter((t) => t.status === 'APPROVED' && t.waTemplateId)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · {t.language} · {t.category}
                  </option>
                ))}
            </select>
          </Field>
          {keys.map((k) => (
            <Field
              key={k}
              label={`Body parameter ${k}`}
              hint="Use a literal value or CRM placeholder: {{firstName}}, {{lastName}}, {{email}}."
            >
              <input
                required
                className={inputClass}
                value={values[k] ?? ''}
                onChange={(e) => setValues({ ...values, [k]: e.target.value })}
              />
            </Field>
          ))}
          <Field label="Audience">
            <select
              className={inputClass}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value="all">All eligible contacts</option>
              <option value="tags">Contacts matching any tag</option>
              <option value="segment">CRM segment</option>
            </select>
          </Field>
          {audience === 'tags' && (
            <Field label="Tags">
              <input
                className={inputClass}
                required
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="vip, newsletter"
              />
            </Field>
          )}
          {audience === 'segment' && (
            <>
              <Field label="Segment">
                <select
                  required
                  className={inputClass}
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                >
                  <option value="">Select segment</option>
                  {segments.data?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              {segments.error && <Notice error>{segments.error}</Notice>}
              <p className="text-xs text-muted-foreground">
                The server rejects unsupported segment rules rather than broadening the audience.
              </p>
            </>
          )}
          <fieldset className="space-y-3 rounded-lg border border-border p-4">
            <legend className="px-2 text-sm font-semibold">Audience safeguards</legend>
            <Field
              label="Exclude contact tags"
              hint="Comma-separated labels. These exclusions are checked again before sending."
            >
              <input
                className={inputClass}
                value={excludeTags}
                onChange={(event) => setExcludeTags(event.target.value)}
                placeholder="do-not-market, employees"
              />
            </Field>
            <Field
              label="Maximum unique recipients (optional)"
              hint="The campaign is blocked if its eligible audience exceeds this limit. This is a message-volume limit, not a monetary estimate."
            >
              <input
                type="number"
                min={1}
                max={1000000}
                className={inputClass}
                value={maxRecipients}
                onChange={(event) => setMaxRecipients(event.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={capEnabled}
                onChange={(event) => setCapEnabled(event.target.checked)}
              />
              Limit campaign messages per recipient
            </label>
            {capEnabled && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Maximum messages">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    className={inputClass}
                    value={maxMessages}
                    onChange={(event) => setMaxMessages(Number(event.target.value))}
                  />
                </Field>
                <Field label="Rolling window (hours)">
                  <input
                    type="number"
                    min={1}
                    max={720}
                    required
                    className={inputClass}
                    value={windowHours}
                    onChange={(event) => setWindowHours(Number(event.target.value))}
                  />
                </Field>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Frequency counts include all campaign categories and sending numbers in this
              workspace, including queued or uncertain sends. Workflow and individual inbox messages
              are outside this campaign-only limit. Duplicate contact numbers receive one campaign
              message.
            </p>
          </fieldset>
          {sendIssue && (
            <Notice error>
              {sendIssue} This broadcast composer accepts basic body parameters only; choose a
              supported template.
            </Notice>
          )}
          <button
            className={buttonClass}
            disabled={busy || !!sendIssue || !selectedPhone || !templateId}
          >
            {busy ? 'Saving…' : 'Save broadcast draft'}
          </button>
        </form>
        <aside className={`${panelClass} self-start space-y-4`}>
          <h2 className="font-semibold">Message preview</h2>
          <p className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">
            {keys.reduce((text, k) => text.replaceAll(k, values[k] || k), templateBody(template)) ||
              'Choose a template to preview its body.'}
          </p>
          <Notice>
            Only eligible recipients with recorded consent can receive outreach. The draft is saved
            without sending or scheduling.
          </Notice>
          <Link className="text-sm text-primary underline" href="/whatsapp/consent">
            Review consent records
          </Link>
        </aside>
      </div>
    </div>
  );
}
