'use client';
import { useState } from 'react';
import {
  whatsappConversationService,
  type WhatsAppConversationSummary,
} from '@/services/whatsapp-conversation.service';
import { parseApiData } from '@/lib/api/parse-response';
import { useResource } from './use-resource';
import { Field, Notice, inputClass, secondaryClass, errorMessage, formatDate } from './ui';

export function ConversationTools({
  phone,
  summary,
  onSaved,
}: {
  phone: string;
  summary?: WhatsAppConversationSummary;
  onSaved: () => Promise<void>;
}) {
  const notes = useResource(
    async () =>
      parseApiData<{ id: string; content: string; createdAt: string }[]>(
        await whatsappConversationService.notes(phone),
      ) ?? [],
  );
  const [note, setNote] = useState('');
  const [tags, setTags] = useState(summary?.tags?.join(', ') ?? '');
  const [priority, setPriority] = useState<NonNullable<WhatsAppConversationSummary['priority']>>(
    summary?.priority ?? 'NORMAL',
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function save(work: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await work();
      await notes.reload();
      await onSaved();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="border-b border-border px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium">
        Contact labels, priority and internal notes
      </summary>
      <div className="mt-4 space-y-4">
        {error && <Notice error>{error}</Notice>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Priority">
            <select
              className={inputClass}
              value={priority}
              onChange={(event) => setPriority(event.target.value as typeof priority)}
            >
              {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field
            label="CRM contact tags"
            hint="Comma-separated labels shared with the contact record."
          >
            <input
              className={inputClass}
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={secondaryClass}
            disabled={busy}
            onClick={() =>
              void save(() =>
                whatsappConversationService.update(phone, {
                  priority,
                  tags: tags
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean),
                }),
              )
            }
          >
            Save labels and priority
          </button>
          <button
            className={secondaryClass}
            disabled={busy}
            onClick={() => void save(() => whatsappConversationService.markRead(phone))}
          >
            Mark read for the team
          </button>
          {summary?.status === 'RESOLVED' && (
            <button
              className={secondaryClass}
              disabled={busy}
              onClick={() =>
                void save(() => whatsappConversationService.update(phone, { status: 'OPEN' }))
              }
            >
              Reopen conversation
            </button>
          )}
        </div>
        <Field label="Internal note" hint="Visible to your team; not sent to the customer.">
          <textarea
            className={inputClass}
            maxLength={5000}
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
        <button
          className={secondaryClass}
          disabled={busy || !note.trim()}
          onClick={() =>
            void save(async () => {
              await whatsappConversationService.addNote(phone, note.trim());
              setNote('');
            })
          }
        >
          Add internal note
        </button>
        {notes.error && <Notice error>{notes.error}</Notice>}
        {notes.data?.map((entry) => (
          <article className="rounded-lg bg-muted p-3 text-sm" key={entry.id}>
            <p className="whitespace-pre-wrap">{entry.content}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
          </article>
        ))}
      </div>
    </details>
  );
}
