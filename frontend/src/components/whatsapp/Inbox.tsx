'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Send } from 'lucide-react';
import {
  whatsappConversationService,
  type WhatsAppConversationSummary,
  type WhatsAppMessage,
} from '@/services/whatsapp-conversation.service';
import {
  whatsappTemplateService,
  type WhatsappTemplate,
} from '@/services/whatsapp-template.service';
import { whatsappAccountService } from '@/services/whatsapp-account.service';
import { contactService, type Contact } from '@/services/contact.service';
import { userService, type User } from '@/services/user.service';
import { parseApiData } from '@/lib/api/parse-response';
import { useResource } from './use-resource';
import {
  templateBody,
  templateParameterKeys,
  templateSendComponents,
  templateSendIssue,
} from './template-utils';
import { DialogShell } from '@/components/ui/dialog-shell';
import { ConversationTools } from './ConversationTools';
import { RichComposer } from './RichComposer';
import {
  PageHeading,
  Notice,
  Loading,
  StatusBadge,
  Field,
  inputClass,
  buttonClass,
  secondaryClass,
  errorMessage,
  formatDate,
} from './ui';
export function Inbox({ initialPhone }: { initialPhone?: string }) {
  const threads = useResource(
    async () =>
      parseApiData<WhatsAppConversationSummary[]>(await whatsappConversationService.list()) ?? [],
    15000,
  );
  const accounts = useResource(whatsappAccountService.list);
  const templates = useResource(
    async () => parseApiData<WhatsappTemplate[]>(await whatsappTemplateService.list()) ?? [],
  );
  const users = useResource(async () => parseApiData<User[]>(await userService.getUsers()) ?? []);
  const [active, setActive] = useState(initialPhone ?? '');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<'text' | 'template' | 'rich'>('text');
  const [richContent, setRichContent] = useState<Record<string, unknown> | null>(null);
  const sendAttempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const clock = useResource(async () => Date.now(), 10000);
  const [templateId, setTemplateId] = useState('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [assignee, setAssignee] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [contactQuery, setContactQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactLoading, setContactLoading] = useState(false);
  const request = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  const summary = threads.data?.find((c) => c.phone === active);
  const connected = accounts.data?.filter((a) => a.status === 'CONNECTED') ?? [];
  const selectedPhoneId =
    summary?.phoneNumberId || phoneId || (connected.length === 1 ? connected[0].phoneNumberId : '');
  const chosen = templates.data?.find((t) => t.id === templateId);
  const sendIssue = templateSendIssue(chosen);
  const keys = sendIssue ? [] : templateParameterKeys(chosen);
  const canText =
    summary?.canReply === true &&
    !!summary.windowExpiresAt &&
    clock.data !== null &&
    Date.parse(summary.windowExpiresAt) > clock.data;
  const capability = connected.find((a) => a.phoneNumberId === selectedPhoneId)?.capabilities;
  const latestOutbound = messages
    .filter((m) => m.direction === 'OUTBOUND' && m.phoneNumberId === selectedPhoneId)
    .sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id),
    )[0];
  const loadMessages = async (phone: string, quiet = false) => {
    const serial = ++request.current;
    if (!quiet) setMessageLoading(true);
    try {
      const result =
        parseApiData<WhatsAppMessage[]>(await whatsappConversationService.getMessages(phone)) ?? [];
      if (serial === request.current) {
        setMessages(result);
      }
    } catch (e) {
      if (serial === request.current) setError(errorMessage(e));
    } finally {
      if (serial === request.current) setMessageLoading(false);
    }
  };
  useEffect(() => {
    if (!active && threads.data?.length) setActive(threads.data[0].phone);
  }, [threads.data, active]);
  useEffect(() => {
    const pending = request;
    setMessages([]);
    setDraft('');
    setRichContent(null);
    setTemplateId('');
    setParameters({});
    setAssignee('');
    setError(null);
    setSendOpen(false);
    if (!active) return;
    void loadMessages(active);
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') void loadMessages(active, true);
    }, 10000);
    return () => {
      pending.current++;
      clearInterval(id);
    };
  }, [active]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);
  useEffect(() => {
    let live = true;
    const timer = setTimeout(() => {
      setContactLoading(true);
      contactService
        .getContacts({ search: contactQuery, page: 1, limit: 25 })
        .then((r) => {
          if (live) setContacts(parseApiData<Contact[]>(r) ?? []);
        })
        .catch((e) => {
          if (live) setError(errorMessage(e));
        })
        .finally(() => {
          if (live) setContactLoading(false);
        });
    }, 350);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [contactQuery]);
  const mutate = async (kind: string, operation: () => Promise<unknown>) => {
    setBusy(kind);
    setError(null);
    try {
      await operation();
      await threads.reload();
      await loadMessages(active, true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy('');
    }
  };
  const ready =
    !!active &&
    !!selectedPhoneId &&
    connected.some((a) => a.phoneNumberId === selectedPhoneId) &&
    (mode === 'text'
      ? canText && !!draft.trim()
      : mode === 'rich'
        ? canText && !!richContent
        : !sendIssue &&
          !!chosen &&
          chosen.status === 'APPROVED' &&
          !!chosen.waTemplateId &&
          keys.every((k) => !!parameters[k]?.trim()));
  const send = async () => {
    if (!ready || busy) return;
    setSendOpen(false);
    await mutate('send', async () => {
      const fingerprint = JSON.stringify({
        active,
        selectedPhoneId,
        mode,
        draft,
        templateId,
        parameters,
        richContent,
      });
      if (sendAttempt.current?.fingerprint !== fingerprint)
        sendAttempt.current = { fingerprint, key: crypto.randomUUID() };
      const key = sendAttempt.current.key;
      const revision = latestOutbound?.id ?? null;
      if (mode === 'text')
        await whatsappConversationService.send(
          active,
          draft.trim(),
          selectedPhoneId,
          key,
          revision,
        );
      else if (mode === 'rich' && richContent)
        await whatsappConversationService.sendContent(
          active,
          richContent,
          selectedPhoneId,
          key,
          revision,
        );
      else if (chosen)
        await whatsappConversationService.sendTemplate(
          active,
          chosen.name,
          chosen.language,
          templateSendComponents(keys, parameters),
          selectedPhoneId,
          key,
          revision,
        );
      setDraft('');
      sendAttempt.current = null;
    });
  };
  return (
    <div className="space-y-5">
      <PageHeading
        title="WhatsApp inbox"
        description="Reply within the customer service window, or use an approved template with recorded consent."
        action={
          <button
            className={secondaryClass}
            onClick={() => {
              void threads.reload();
              if (active) void loadMessages(active);
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />
      {(error || threads.error || accounts.error) && (
        <Notice error>{error || threads.error || accounts.error}</Notice>
      )}
      <div className="grid min-h-[650px] overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[310px_1fr]">
        <aside className="space-y-3 border-b border-border p-4 lg:border-b-0 lg:border-r">
          <Field label="Find conversations">
            <input
              className={inputClass}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, phone, or message"
            />
          </Field>
          <select
            aria-label="Conversation status"
            className={inputClass}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All conversations</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
          <div className="max-h-80 overflow-y-auto lg:max-h-[430px]">
            {threads.loading ? (
              <Loading />
            ) : (
              threads.data
                ?.filter(
                  (c) =>
                    (filter === 'ALL' ||
                      (filter === 'UNASSIGNED' ? !c.assigneeId : c.status === filter)) &&
                    `${c.contactName} ${c.phone} ${c.lastMessage}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map((c) => (
                  <button
                    key={c.phone}
                    className={`mb-1 block w-full rounded-lg p-3 text-left hover:bg-muted ${active === c.phone ? 'bg-muted' : ''}`}
                    onClick={() => setActive(c.phone)}
                  >
                    <div className="flex justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {c.contactName || `+${c.phone}`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.unreadCount > 0 ? `${c.unreadCount} unread` : c.status}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                  </button>
                ))
            )}
          </div>
          <div className="border-t border-border pt-3">
            <Field label="Start from a CRM contact">
              <input
                className={inputClass}
                placeholder="Search contacts"
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
              />
            </Field>
            <select
              aria-label="Select CRM contact"
              value=""
              className={`${inputClass} mt-2`}
              disabled={contactLoading}
              onChange={(e) => {
                const c = contacts.find((c) => c.id === e.target.value);
                const phone = (c?.mobile || c?.phone || '').replace(/\D/g, '');
                if (/^[1-9]\d{7,14}$/.test(phone)) {
                  setActive(phone);
                  setMode('template');
                } else
                  setError('Contact needs an international phone number including a country code.');
              }}
            >
              <option value="">{contactLoading ? 'Loading contacts…' : 'Select contact'}</option>
              {contacts
                .filter((c) => c.mobile || c.phone)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} · {c.mobile || c.phone}
                  </option>
                ))}
            </select>
          </div>
        </aside>
        <section className="flex min-w-0 flex-col">
          {!active ? (
            <div className="p-6">
              <Notice>Select a conversation or CRM contact to open a thread.</Notice>
            </div>
          ) : (
            <>
              <header className="space-y-3 border-b border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{summary?.contactName || `+${active}`}</h2>
                    <p className="text-xs text-muted-foreground">{summary?.phone || active}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={summary?.status || 'NEW'} />
                    <button
                      className={secondaryClass}
                      disabled={!!busy || !summary || summary.status === 'RESOLVED'}
                      onClick={() =>
                        void mutate('resolve', () => whatsappConversationService.resolve(active))
                      }
                    >
                      Resolve
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Assigned teammate">
                    <div className="flex gap-2">
                      <select
                        className={inputClass}
                        value={assignee || summary?.assigneeId || ''}
                        disabled={!!users.error}
                        onChange={(e) => setAssignee(e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {users.data?.map((u) => (
                          <option key={u.id} value={u.id}>
                            {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email}
                          </option>
                        ))}
                      </select>
                      <button
                        className={secondaryClass}
                        disabled={!assignee || !!busy || !summary}
                        onClick={() =>
                          void mutate('assign', () =>
                            whatsappConversationService.assign(active, assignee),
                          )
                        }
                      >
                        Assign
                      </button>
                    </div>
                  </Field>
                  <Field label="Sending number">
                    <select
                      className={inputClass}
                      disabled={!!summary?.phoneNumberId}
                      value={selectedPhoneId}
                      onChange={(e) => setPhoneId(e.target.value)}
                    >
                      <option value="">Select connected number</option>
                      {connected.map((a) => (
                        <option key={a.id} value={a.phoneNumberId}>
                          {a.displayPhoneNumber || a.phoneNumberId}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                {users.error && (
                  <p className="text-xs text-muted-foreground">
                    Teammate selection is unavailable: {users.error}
                  </p>
                )}
                <Notice>
                  {canText
                    ? `Reply window open until ${formatDate(summary?.windowExpiresAt)}.`
                    : summary?.replyBlockedReason ||
                      'Text replies are unavailable until the customer opens a service window. Select an approved template.'}
                </Notice>
              </header>
              {summary && (
                <ConversationTools
                  key={`${active}:${summary.phoneNumberId}`}
                  phone={active}
                  summary={summary}
                  onSaved={threads.reload}
                />
              )}
              <div
                aria-live="polite"
                className="max-h-[450px] min-h-[220px] flex-1 space-y-4 overflow-y-auto bg-background p-4"
              >
                {messageLoading ? (
                  <Loading />
                ) : messages.length ? (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                    >
                      <article
                        className={`max-w-[85%] rounded-xl border p-3 text-sm ${m.direction === 'OUTBOUND' ? 'border-primary/20 bg-primary/10' : 'border-border bg-card'}`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        {m.mediaUrls?.length ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Media received. Download preview is not available for this provider.
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDate(m.createdAt)} · {m.status}
                        </p>
                      </article>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No messages in this thread yet.</p>
                )}
                <div ref={end} />
              </div>
              <div className="space-y-3 border-t border-border p-4">
                <div className="flex gap-2">
                  <button
                    className={secondaryClass}
                    aria-pressed={mode === 'text'}
                    onClick={() => setMode('text')}
                  >
                    Text reply
                  </button>
                  <button
                    className={secondaryClass}
                    aria-pressed={mode === 'template'}
                    onClick={() => setMode('template')}
                  >
                    Approved template
                  </button>
                  {(capability?.media || capability?.interactive) && (
                    <button
                      className={secondaryClass}
                      aria-pressed={mode === 'rich'}
                      onClick={() => setMode('rich')}
                    >
                      Media / buttons
                    </button>
                  )}
                  <Link
                    href="/whatsapp/consent"
                    className="ml-auto self-center text-xs text-primary underline"
                  >
                    Consent records
                  </Link>
                </div>
                {mode === 'text' ? (
                  <Field label="Reply">
                    <textarea
                      rows={3}
                      maxLength={4096}
                      disabled={!canText}
                      className={inputClass}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                  </Field>
                ) : mode === 'rich' ? (
                  <RichComposer
                    media={capability?.media ?? false}
                    interactive={capability?.interactive ?? false}
                    onChange={setRichContent}
                  />
                ) : (
                  <>
                    <Field label="Approved template">
                      <select
                        className={inputClass}
                        value={templateId}
                        onChange={(e) => {
                          setTemplateId(e.target.value);
                          setParameters({});
                        }}
                      >
                        <option value="">Select approved template</option>
                        {templates.data
                          ?.filter((t) => t.status === 'APPROVED' && t.waTemplateId)
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} · {t.language} · {t.category}
                            </option>
                          ))}
                      </select>
                    </Field>
                    {chosen && (
                      <p className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">
                        {templateBody(chosen)}
                      </p>
                    )}
                    {keys.map((k) => (
                      <Field key={k} label={`Parameter ${k}`}>
                        <input
                          className={inputClass}
                          value={parameters[k] ?? ''}
                          onChange={(e) => setParameters({ ...parameters, [k]: e.target.value })}
                        />
                      </Field>
                    ))}
                    {templates.error && <Notice error>{templates.error}</Notice>}
                    {sendIssue && (
                      <Notice error>
                        {sendIssue} Choose a supported template or supply header/button parameters
                        through the developer API.
                      </Notice>
                    )}
                    <p className="text-xs text-muted-foreground">
                      The server checks recipient consent before sending an approved template.
                    </p>
                  </>
                )}
                {connected.length === 0 && (
                  <Notice>Connect an account in Accounts before sending.</Notice>
                )}
                <button
                  className={buttonClass}
                  disabled={!ready || !!busy}
                  onClick={() => setSendOpen(true)}
                >
                  <Send className="h-4 w-4" />
                  {busy === 'send' ? 'Sending…' : 'Review message'}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
      <DialogShell open={sendOpen} onOpenChange={setSendOpen} title="Review WhatsApp message">
        <div className="space-y-4 p-6">
          <h2 className="font-semibold">Send to +{active}?</h2>
          <p className="text-sm text-muted-foreground">
            This sends a real WhatsApp message from {selectedPhoneId}.
          </p>
          <p className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">
            {mode === 'text'
              ? draft
              : mode === 'rich'
                ? JSON.stringify(richContent, null, 2)
                : keys.reduce(
                    (body, k) => body.replaceAll(k, parameters[k] || k),
                    templateBody(chosen),
                  )}
          </p>
          <div className="flex gap-2">
            <button className={secondaryClass} onClick={() => setSendOpen(false)}>
              Keep editing
            </button>
            <button className={buttonClass} disabled={!ready || !!busy} onClick={() => void send()}>
              Send message
            </button>
          </div>
        </div>
      </DialogShell>
    </div>
  );
}
