'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  whatsappBroadcastService,
  type WhatsappBroadcast,
  type BroadcastPreview,
  type BroadcastRecipient,
} from '@/services/whatsapp-broadcast.service';
import { parseApiData } from '@/lib/api/parse-response';
import { useResource } from './use-resource';
import { DialogShell } from '@/components/ui/dialog-shell';
import {
  PageHeading,
  Notice,
  Loading,
  StatusBadge,
  Field,
  inputClass,
  buttonClass,
  secondaryClass,
  panelClass,
  errorMessage,
  formatDate,
} from './ui';
type Action = 'send' | 'schedule' | 'pause' | 'resume' | 'cancel' | 'remove';
export function BroadcastDetail({ id }: { id: string }) {
  const router = useRouter();
  const broadcast = useResource(
    async () => parseApiData<WhatsappBroadcast>(await whatsappBroadcastService.get(id)),
    10000,
  );
  const [preview, setPreview] = useState<BroadcastPreview | null>(null);
  const [at, setAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [recipients, setRecipients] = useState<BroadcastRecipient[]>([]);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const b = broadcast.data;
  async function loadRecipients() {
    setBusy(true);
    setError(null);
    try {
      const page = parseApiData<{ items: BroadcastRecipient[]; nextCursor: string | null }>(
        await whatsappBroadcastService.recipients(id, cursor ?? undefined),
      );
      if (!page) throw new Error('Recipient page was not returned');
      setRecipients((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  async function duplicate() {
    setBusy(true);
    setError(null);
    try {
      const copy = parseApiData<WhatsappBroadcast>(await whatsappBroadcastService.duplicate(id));
      if (!copy) throw new Error('Draft was not returned');
      router.push(`/whatsapp/broadcast/${copy.id}`);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  function exportRecipients() {
    const cell = (value: unknown) => {
      const text = String(value ?? '');
      return `"${(/^[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`;
    };
    const csv = [
      ['Contact ID', 'Phone', 'Outcome', 'Message ID', 'Error'],
      ...recipients.map((row) => [
        row.contactId,
        row.phone,
        row.outcome ?? 'Pending',
        row.messageId,
        row.error,
      ]),
    ]
      .map((row) => row.map(cell).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'whatsapp-campaign-recipients.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
  const clock = useResource(async () => Date.now(), 10000);
  const review = async () => {
    setBusy(true);
    setError(null);
    try {
      setPreview(parseApiData(await whatsappBroadcastService.preview(id)));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const run = async () => {
    if (!action) return;
    setBusy(true);
    setError(null);
    try {
      if (action === 'schedule') {
        if (!at || new Date(at).getTime() <= Date.now())
          throw new Error('Choose a future schedule time.');
        await whatsappBroadcastService.schedule(id, new Date(at).toISOString());
      } else await whatsappBroadcastService[action](id);
      setNotice(
        `Broadcast ${action === 'remove' ? 'deleted' : action === 'send' ? 'queued' : action === 'schedule' ? 'scheduled' : action === 'pause' ? 'paused' : action === 'resume' ? 'resumed' : 'cancelled'}.`,
      );
      setAction(null);
      if (action === 'remove') {
        router.push('/whatsapp/broadcast');
        return;
      }
      await broadcast.reload();
      setPreview(null);
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'Choose a future schedule time.'
          ? e.message
          : errorMessage(e),
      );
    } finally {
      setBusy(false);
    }
  };
  const canStart = b && ['DRAFT', 'SCHEDULED'].includes(b.status);
  const validTime = !!at && clock.data !== null && new Date(at).getTime() > clock.data;
  if (broadcast.loading) return <Loading />;
  return (
    <div className="space-y-6">
      <PageHeading
        title={b?.name || 'Broadcast detail'}
        description="Preview eligibility and review every action before it changes customer outreach."
        action={
          <Link className={secondaryClass} href="/whatsapp/broadcast">
            Back to broadcasts
          </Link>
        }
      />
      {(error || broadcast.error) && <Notice error>{error || broadcast.error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      {b?.lastError && (
        <Notice error>
          Audience preparation stopped: {b.lastError}. Correct the configuration in a new draft
          before sending.
        </Notice>
      )}
      {b && (
        <>
          <div className="flex flex-wrap gap-3">
            <StatusBadge value={b.status} />
            <span className="self-center text-sm text-muted-foreground">
              Sending number: {b.phoneNumberId || 'Not configured'} · Scheduled:{' '}
              {formatDate(b.scheduledAt)}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Recipients', b.total],
              ['Accepted', b.sent],
              ['Failed', b.failed],
            ].map(([label, value]) => (
              <div className={panelClass} key={label}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <section className={`${panelClass} space-y-4`}>
            <h2 className="font-semibold">Audience eligibility</h2>
            <p className="text-sm text-muted-foreground">
              Preview checks the current audience and consent without sending messages. Eligibility
              is checked again during execution.
            </p>
            <button className={secondaryClass} disabled={busy} onClick={() => void review()}>
              {busy ? 'Checking…' : 'Preview eligible recipients'}
            </button>
            {preview && (
              <dl className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Matched contacts', preview.recipientCount],
                  ['Eligible', preview.eligible],
                  ['Blocked', preview.blocked],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-xl font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {preview?.limitExceeded && (
              <Notice error>
                The eligible audience exceeds the {preview.maxRecipients} recipient limit. Narrow
                the audience or create a new draft with an appropriate limit.
              </Notice>
            )}
            {b.contactFilter?.frequencyCap && (
              <Notice>
                Campaign frequency cap: {b.contactFilter.frequencyCap.maxMessages} messages per
                recipient across this workspace within {b.contactFilter.frequencyCap.windowHours}{' '}
                hours.
              </Notice>
            )}
            <p className="text-xs text-muted-foreground">
              Audience:{' '}
              {b.contactFilter?.tags?.length
                ? `tags ${b.contactFilter.tags.join(', ')}`
                : b.contactFilter?.segmentIds?.length
                  ? 'selected CRM segments'
                  : 'all matching contacts'}
            </p>
          </section>
          <section className={`${panelClass} space-y-4`}>
            <h2 className="font-semibold">Delivery controls</h2>
            <button className={secondaryClass} disabled={busy} onClick={() => void duplicate()}>
              Duplicate as a new draft
            </button>
            {canStart && (
              <>
                <Field label="Schedule in your local timezone">
                  <input
                    type="datetime-local"
                    className={`${inputClass} max-w-sm`}
                    value={at}
                    onChange={(e) => setAt(e.target.value)}
                  />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={buttonClass}
                    disabled={
                      busy || !preview?.eligible || preview.limitExceeded || !b.phoneNumberId
                    }
                    onClick={() => setAction('send')}
                  >
                    Review send now
                  </button>
                  <button
                    className={secondaryClass}
                    disabled={
                      busy ||
                      !preview?.eligible ||
                      preview.limitExceeded ||
                      !validTime ||
                      !b.phoneNumberId
                    }
                    onClick={() => setAction('schedule')}
                  >
                    Review schedule
                  </button>
                </div>
                {!preview && (
                  <Notice>Preview recipient eligibility before sending or scheduling.</Notice>
                )}
              </>
            )}
            <div className="flex flex-wrap gap-2">
              {['SCHEDULED', 'SENDING'].includes(b.status) && (
                <button
                  className={secondaryClass}
                  disabled={busy}
                  onClick={() => setAction('pause')}
                >
                  Pause
                </button>
              )}
              {b.status === 'PAUSED' && (
                <button
                  className={secondaryClass}
                  disabled={busy}
                  onClick={() => setAction('resume')}
                >
                  Review resume
                </button>
              )}
              {['DRAFT', 'SCHEDULED', 'SENDING', 'PAUSED'].includes(b.status) && (
                <button
                  className={secondaryClass}
                  disabled={busy}
                  onClick={() => setAction('cancel')}
                >
                  Cancel broadcast
                </button>
              )}
              {['DRAFT', 'COMPLETED', 'FAILED', 'CANCELLED'].includes(b.status) && (
                <button
                  className={secondaryClass}
                  disabled={busy}
                  onClick={() => setAction('remove')}
                >
                  Delete broadcast
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Pause or cancel stops remaining work. Messages already accepted by Meta cannot be
              recalled. Accepted counts are not delivery confirmations.
            </p>
          </section>
          <section className={`${panelClass} space-y-4`}>
            <h2 className="font-semibold">Recipient delivery log</h2>
            <p className="text-sm text-muted-foreground">
              Prepared recipients and stored outcomes. Provider acceptance is not confirmation of
              delivery. Export includes only the records loaded below.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                className={secondaryClass}
                disabled={busy || cursor === null}
                onClick={() => void loadRecipients()}
              >
                {cursor === undefined
                  ? 'Load recipients'
                  : cursor === null
                    ? 'All recipients loaded'
                    : 'Load next 100'}
              </button>
              <button
                className={secondaryClass}
                disabled={!recipients.length}
                onClick={exportRecipients}
              >
                Export {recipients.length} loaded recipients
              </button>
            </div>
            {cursor === null && !recipients.length && (
              <Notice>
                No recipients have been prepared. Saving or previewing a campaign does not prepare
                or send messages.
              </Notice>
            )}
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Outcome</th>
                    <th className="p-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((row) => (
                    <tr className="border-t border-border" key={row.contactId}>
                      <td className="p-2">{row.phone}</td>
                      <td className="p-2">{row.outcome ?? 'Pending'}</td>
                      <td className="p-2">{row.error ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      <DialogShell
        open={!!action}
        onOpenChange={(o) => !o && setAction(null)}
        title="Review broadcast action"
      >
        <div className="space-y-4 p-6">
          <h2 className="font-semibold">
            {action === 'send'
              ? 'Send broadcast now?'
              : action === 'schedule'
                ? 'Schedule customer outreach?'
                : action === 'resume'
                  ? 'Resume customer outreach?'
                  : action === 'remove'
                    ? 'Delete broadcast?'
                    : action === 'pause'
                      ? 'Pause remaining messages?'
                      : 'Cancel remaining messages?'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {['send', 'schedule', 'resume'].includes(action || '')
              ? `This action can send real WhatsApp messages from ${b?.phoneNumberId}.${action === 'schedule' ? ` Scheduled for ${formatDate(at)}.` : ''}`
              : 'This changes the broadcast state. Already accepted messages cannot be recalled.'}
          </p>
          {preview && (
            <p className="text-sm">
              {preview.eligible} currently eligible recipients · {preview.blocked} blocked
            </p>
          )}
          <div className="flex gap-2">
            <button className={secondaryClass} disabled={busy} onClick={() => setAction(null)}>
              Go back
            </button>
            <button className={buttonClass} disabled={busy} onClick={() => void run()}>
              {busy ? 'Applying…' : 'Confirm action'}
            </button>
          </div>
        </div>
      </DialogShell>
    </div>
  );
}
