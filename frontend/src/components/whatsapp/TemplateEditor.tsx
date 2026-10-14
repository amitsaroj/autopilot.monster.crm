'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  whatsappTemplateService,
  buildComponents,
  type WhatsappTemplate,
  type CreateWhatsappTemplatePayload,
  type TemplateButton,
} from '@/services/whatsapp-template.service';
import { parseApiData } from '@/lib/api/parse-response';
import { whatsappAccountService } from '@/services/whatsapp-account.service';
import { DialogShell } from '@/components/ui/dialog-shell';
import { useResource } from './use-resource';
import { templateComponents, templateSendIssue } from './template-utils';
import {
  PageHeading,
  Notice,
  Loading,
  Field,
  inputClass,
  buttonClass,
  secondaryClass,
  panelClass,
  errorMessage,
} from './ui';

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
const variableKeys = (text: string) =>
  [...new Set(text.match(/\{\{\d+\}\}/g) ?? [])].sort(
    (a, b) => Number(a.slice(2, -2)) - Number(b.slice(2, -2)),
  );
const invalidVariables = (text: string) =>
  variableKeys(text).some((key, i) => key !== `{{${i + 1}}}`) ||
  /\{\{|\}\}/.test(text.replace(/\{\{\d+\}\}/g, ''));

export function TemplateEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<CreateWhatsappTemplatePayload>({
    name: '',
    category: 'MARKETING',
    language: 'en_US',
    body: '',
    header: '',
    footer: '',
    bodyExamples: [],
    headerFormat: 'TEXT',
    headerExample: '',
    buttons: [],
  });
  const [template, setTemplate] = useState<WhatsappTemplate>();
  const accounts = useResource(whatsappAccountService.list);
  const [phoneId, setPhoneId] = useState('');
  const [savedForm, setSavedForm] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState('');
  useEffect(() => {
    if (!id) return;
    let live = true;
    whatsappTemplateService
      .get(id)
      .then((r) => {
        const t = parseApiData<WhatsappTemplate>(r);
        if (!t) throw new Error('Template missing');
        const list = templateComponents(t);
        const body = list.find((c) => c.type === 'BODY');
        const header = list.find((c) => c.type === 'HEADER');
        const footer = list.find((c) => c.type === 'FOOTER');
        const rawButtons = list.find((c) => c.type === 'BUTTONS')?.buttons;
        const buttons: TemplateButton[] = [];
        let unavailable =
          list.filter((c) => c.type === 'BODY').length !== 1 ||
          new Set(list.map((c) => c.type)).size !== list.length ||
          list.some((c) => !['BODY', 'HEADER', 'FOOTER', 'BUTTONS'].includes(String(c.type))) ||
          (header && !['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'].includes(String(header.format))) ||
          invalidVariables(String(body?.text ?? '')) ||
          invalidVariables(String(header?.text ?? '')) ||
          list.some((c) =>
            Object.keys(c).some(
              (key) =>
                !(
                  c.type === 'HEADER'
                    ? ['type', 'format', 'text', 'example']
                    : c.type === 'BUTTONS'
                      ? ['type', 'buttons']
                      : ['type', 'text', 'example']
                ).includes(key),
            ),
          );
        if (Array.isArray(rawButtons))
          for (const item of rawButtons) {
            const b = record(item);
            if (
              Object.keys(b).some(
                (key) =>
                  !(
                    b.type === 'URL'
                      ? ['type', 'text', 'url', 'example']
                      : b.type === 'PHONE_NUMBER'
                        ? ['type', 'text', 'phone_number']
                        : b.type === 'COPY_CODE'
                          ? ['type', 'example']
                          : ['type', 'text']
                  ).includes(key),
              )
            )
              unavailable = true;
            if (b.type === 'QUICK_REPLY')
              buttons.push({ type: b.type, text: String(b.text ?? '') });
            else if (b.type === 'PHONE_NUMBER')
              buttons.push({
                type: b.type,
                text: String(b.text ?? ''),
                phone_number: String(b.phone_number ?? ''),
              });
            else if (b.type === 'URL')
              buttons.push({
                type: b.type,
                text: String(b.text ?? ''),
                url: String(b.url ?? ''),
                example: strings(b.example),
              });
            else if (b.type === 'COPY_CODE')
              buttons.push({ type: b.type, example: String(b.example ?? '') });
            else unavailable = true;
          }
        const format = header?.format;
        if (live) {
          setTemplate(t);
          setUnsupported(
            unavailable
              ? 'This template contains a format this editor cannot preserve. Editing is disabled; manage it in Meta.'
              : '',
          );
          const loadedForm: CreateWhatsappTemplatePayload = {
            name: t.name,
            category: t.category,
            language: t.language,
            body: String(body?.text ?? ''),
            header: String(header?.text ?? ''),
            footer: String(footer?.text ?? ''),
            bodyExamples: strings(stringsOrRows(record(body?.example).body_text)[0]),
            headerFormat:
              format === 'IMAGE' || format === 'VIDEO' || format === 'DOCUMENT' ? format : 'TEXT',
            headerExample:
              strings(
                record(header?.example)[format === 'TEXT' ? 'header_text' : 'header_handle'],
              )[0] ?? '',
            buttons,
          };
          setForm(loadedForm);
          setSavedForm(JSON.stringify(loadedForm));
        }
      })
      .catch((e) => live && setError(errorMessage(e)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id]);
  const keys = variableKeys(form.body);
  const invalid =
    invalidVariables(form.body) ||
    invalidVariables(form.header ?? '') ||
    variableKeys(form.header ?? '').length > 1;
  const buttons = form.buttons ?? [];
  const connected = accounts.data?.filter((a) => a.status === 'CONNECTED') ?? [];
  const matching = connected.filter(
    (a) => !template?.businessAccountId || a.businessAccountId === template.businessAccountId,
  );
  const selectedAccount =
    connected.find((a) => a.phoneNumberId === phoneId) ??
    (!phoneId && matching.length === 1 ? matching[0] : undefined);
  const canUseAccount =
    !!selectedAccount &&
    !accounts.loading &&
    !accounts.error &&
    (!template?.businessAccountId ||
      template.businessAccountId === selectedAccount.businessAccountId);
  const dirty = savedForm !== JSON.stringify(form);
  const providerAction = async (kind: 'submit' | 'refresh') => {
    if (
      !id ||
      !template ||
      !canUseAccount ||
      !selectedAccount ||
      busy ||
      (kind === 'submit' && (dirty || !!unsupported))
    )
      return;
    setBusy(true);
    setError(null);
    setNotice('');
    setConfirmSubmit(false);
    try {
      const response =
        kind === 'submit'
          ? await whatsappTemplateService.sync(id, selectedAccount.phoneNumberId)
          : await whatsappTemplateService.refresh(id, selectedAccount.phoneNumberId);
      const updated = parseApiData<WhatsappTemplate>(response);
      if (!updated) throw new Error('Template missing');
      setTemplate(updated);
      setNotice(`Meta status: ${updated.status}. ${updated.rejectionReason ?? ''}`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const changeButton = (index: number, button: TemplateButton) =>
    setForm({ ...form, buttons: buttons.map((b, i) => (i === index ? button : b)) });
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (invalid || unsupported) return;
    setBusy(true);
    try {
      const payload = { ...form, bodyExamples: keys.map((_, i) => form.bodyExamples?.[i] ?? '') };
      if (id) await whatsappTemplateService.update(id, payload);
      else await whatsappTemplateService.create(payload);
      router.push('/whatsapp/templates');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <Loading />;
  const media = form.headerFormat !== 'TEXT';
  return (
    <div className="space-y-6">
      <PageHeading
        title={id ? 'Edit template draft' : 'Create template'}
        description="Save a local draft, then submit it separately for Meta approval."
        action={
          <Link className={secondaryClass} href="/whatsapp/templates">
            Back to templates
          </Link>
        }
      />
      {error && <Notice error>{error}</Notice>}
      {accounts.error && <Notice error>{accounts.error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      {unsupported && <Notice error>{unsupported}</Notice>}
      {template && (
        <Notice>
          Meta status: {template.status}. {template.rejectionReason} Saving edits requires
          submission before sending.
        </Notice>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={(e) => void save(e)} className={`${panelClass} space-y-4`}>
          <fieldset disabled={busy || !!unsupported || (!!id && !template)} className="space-y-4">
            <Field label="Template name" hint="Submitted names and languages cannot be changed.">
              <input
                className={inputClass}
                required
                disabled={!!template?.waTemplateId}
                pattern="[a-z0-9_]+"
                maxLength={255}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {['MARKETING', 'UTILITY', 'AUTHENTICATION'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Language code">
                <input
                  required
                  disabled={!!template?.waTemplateId}
                  className={inputClass}
                  pattern="[a-z]{2,3}(_[A-Z]{2})?"
                  maxLength={10}
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                />
              </Field>
            </div>
            {form.category === 'AUTHENTICATION' && (
              <Notice>
                Authentication requires Meta’s specialized OTP schema. This editor supports
                marketing and utility components; save is disabled for authentication.
              </Notice>
            )}
            <Field label="Header format">
              <select
                className={inputClass}
                value={form.headerFormat}
                onChange={(e) =>
                  setForm({
                    ...form,
                    headerFormat: e.target.value as CreateWhatsappTemplatePayload['headerFormat'],
                    headerExample: '',
                  })
                }
              >
                {['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
            {!media && (
              <Field label="Text header (optional)" hint="Supports one variable: {{1}}.">
                <input
                  maxLength={60}
                  className={inputClass}
                  value={form.header}
                  onChange={(e) => setForm({ ...form, header: e.target.value })}
                />
              </Field>
            )}
            {(media || form.header?.includes('{{')) && (
              <Field
                label={media ? 'Approval media upload handle' : 'Header variable example'}
                hint={
                  media
                    ? 'Paste an existing Meta resumable-upload handle. A URL or send-time media ID is not an approval upload handle.'
                    : undefined
                }
              >
                <input
                  required
                  className={inputClass}
                  value={form.headerExample}
                  onChange={(e) => setForm({ ...form, headerExample: e.target.value })}
                />
              </Field>
            )}
            <Field label="Message body" hint="Use sequential {{1}}, {{2}}, … and supply examples.">
              <textarea
                required
                rows={6}
                maxLength={1024}
                className={inputClass}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </Field>
            {invalid && (
              <Notice error>
                Use sequential body variables starting at {'{{1}}'} and at most one header variable.
              </Notice>
            )}
            {keys.map((key, i) => (
              <Field key={key} label={`Body example for ${key}`}>
                <input
                  required
                  className={inputClass}
                  value={form.bodyExamples?.[i] ?? ''}
                  onChange={(e) => {
                    const examples = [...(form.bodyExamples ?? [])];
                    examples[i] = e.target.value;
                    setForm({ ...form, bodyExamples: examples });
                  }}
                />
              </Field>
            ))}
            <Field label="Footer (optional)">
              <input
                maxLength={60}
                pattern="[^{}]*"
                className={inputClass}
                value={form.footer}
                onChange={(e) => setForm({ ...form, footer: e.target.value })}
              />
            </Field>
            <div className="space-y-3">
              <h2 className="font-semibold">Buttons</h2>
              {buttons.map((b, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-border p-3">
                  <Field label={`Button ${i + 1} type`}>
                    <select
                      className={inputClass}
                      value={b.type}
                      onChange={(e) => {
                        const type = e.target.value;
                        changeButton(
                          i,
                          type === 'URL'
                            ? { type, text: '', url: '' }
                            : type === 'PHONE_NUMBER'
                              ? { type, text: '', phone_number: '' }
                              : type === 'COPY_CODE'
                                ? { type, example: '' }
                                : { type: 'QUICK_REPLY', text: '' },
                        );
                      }}
                    >
                      {['QUICK_REPLY', 'URL', 'PHONE_NUMBER', 'COPY_CODE'].map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </Field>
                  {b.type !== 'COPY_CODE' && (
                    <Field label={`Button ${i + 1} label`}>
                      <input
                        required
                        maxLength={25}
                        pattern="[^{}]*"
                        className={inputClass}
                        value={b.text}
                        onChange={(e) => changeButton(i, { ...b, text: e.target.value })}
                      />
                    </Field>
                  )}
                  {b.type === 'PHONE_NUMBER' && (
                    <Field
                      label="Phone number"
                      hint="International format, for example +15551234567."
                    >
                      <input
                        required
                        pattern="\+[1-9][0-9]{6,14}"
                        className={inputClass}
                        value={b.phone_number}
                        onChange={(e) => changeButton(i, { ...b, phone_number: e.target.value })}
                      />
                    </Field>
                  )}
                  {b.type === 'URL' && (
                    <>
                      <Field label="Button URL" hint="Optional variable {{1}} must be at the end.">
                        <input
                          required
                          maxLength={2000}
                          className={inputClass}
                          value={b.url}
                          onChange={(e) =>
                            changeButton(i, {
                              ...b,
                              url: e.target.value,
                              example: e.target.value.includes('{{') ? b.example : undefined,
                            })
                          }
                        />
                      </Field>
                      {b.url.includes('{{') && (
                        <Field label="URL variable example">
                          <input
                            required
                            className={inputClass}
                            value={b.example?.[0] ?? ''}
                            onChange={(e) => changeButton(i, { ...b, example: [e.target.value] })}
                          />
                        </Field>
                      )}
                    </>
                  )}
                  {b.type === 'COPY_CODE' && (
                    <Field label="Coupon code example">
                      <input
                        required
                        maxLength={20}
                        className={inputClass}
                        value={b.example}
                        onChange={(e) => changeButton(i, { ...b, example: e.target.value })}
                      />
                    </Field>
                  )}
                  <button
                    type="button"
                    className={secondaryClass}
                    onClick={() => setForm({ ...form, buttons: buttons.filter((_, n) => n !== i) })}
                  >
                    Remove button {i + 1}
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={buttons.length >= 10}
                className={secondaryClass}
                onClick={() =>
                  setForm({ ...form, buttons: [...buttons, { type: 'QUICK_REPLY', text: '' }] })
                }
              >
                Add button
              </button>
              <p className="text-xs text-muted-foreground">
                Up to 10 total, 2 URL buttons, 1 phone button, and 1 copy-code button. Keep quick
                replies grouped together.
              </p>
            </div>
            <button
              className={buttonClass}
              disabled={invalid || form.category === 'AUTHENTICATION'}
            >
              {busy ? 'Saving…' : 'Save draft'}
            </button>
          </fieldset>
        </form>
        <aside className={`${panelClass} self-start space-y-4`}>
          {id && template && (
            <div className="space-y-3">
              <Field
                label="Meta sending account"
                hint="Provider actions apply to the saved draft. Save edits before submitting."
              >
                <select
                  className={inputClass}
                  value={selectedAccount?.phoneNumberId ?? ''}
                  disabled={busy || accounts.loading || !!accounts.error}
                  onChange={(e) => {
                    setPhoneId(e.target.value);
                    setConfirmSubmit(false);
                  }}
                >
                  <option value="">Select connected number</option>
                  {connected.map((a) => (
                    <option
                      key={a.id}
                      value={a.phoneNumberId}
                      disabled={
                        !!template.businessAccountId &&
                        template.businessAccountId !== a.businessAccountId
                      }
                    >
                      {a.displayPhoneNumber || a.phoneNumberId} · {a.businessAccountId}
                    </option>
                  ))}
                </select>
              </Field>
              {!canUseAccount && (
                <Notice>
                  Choose a connected number
                  {template.businessAccountId
                    ? ` from business account ${template.businessAccountId}`
                    : ''}{' '}
                  to submit or refresh this draft.
                </Notice>
              )}
              <div className="flex flex-wrap gap-2">
                {(!template.waTemplateId || template.status !== 'APPROVED') && (
                  <button
                    type="button"
                    className={secondaryClass}
                    disabled={busy || !canUseAccount || dirty || !!unsupported}
                    onClick={() => setConfirmSubmit(true)}
                  >
                    Submit saved draft to Meta
                  </button>
                )}
                {template.waTemplateId && (
                  <button
                    type="button"
                    className={secondaryClass}
                    disabled={busy || !canUseAccount}
                    onClick={() => void providerAction('refresh')}
                  >
                    Refresh status
                  </button>
                )}
              </div>
              {dirty && (
                <p className="text-xs text-muted-foreground">
                  Save your changes before submitting them for approval.
                </p>
              )}
            </div>
          )}
          <h2 className="font-semibold">Message preview</h2>
          <article className="rounded-xl border border-border bg-background p-4">
            {media ? (
              <div className="rounded-lg bg-muted p-5 text-sm">
                {form.headerFormat} header ·{' '}
                {form.headerExample ? 'Approval handle supplied' : 'Approval handle required'}
              </div>
            ) : (
              <h3 className="font-medium">
                {form.header?.replaceAll('{{1}}', form.headerExample || '{{1}}')}
              </h3>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {keys.reduce(
                (body, key, i) => body.replaceAll(key, form.bodyExamples?.[i] || key),
                form.body,
              ) || 'Your message body will appear here.'}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">{form.footer}</p>
            <div className="mt-3 space-y-2">
              {buttons.map((b, i) => (
                <div key={i} className="rounded-lg border border-border p-2 text-center text-sm">
                  {b.type === 'COPY_CODE'
                    ? `Copy code: ${b.example || 'example'}`
                    : b.text || 'Button label'}
                  {b.type === 'URL' && (
                    <p className="break-all text-xs text-muted-foreground">
                      {b.url.replaceAll('{{1}}', b.example?.[0] || '{{1}}')}
                    </p>
                  )}
                  {b.type === 'PHONE_NUMBER' && (
                    <p className="text-xs text-muted-foreground">{b.phone_number}</p>
                  )}
                </div>
              ))}
            </div>
          </article>
          <p className="text-xs text-muted-foreground">
            Preview sends nothing. Media is shown as a placeholder; approval handles cannot be used
            as send-time media.
          </p>
          <Notice>
            {templateSendIssue({
              id: '',
              name: form.name,
              language: form.language,
              category: form.category,
              status: 'PENDING',
              components: buildComponents(form),
            }) ??
              'This composer can send the static components with body parameters after approval.'}
          </Notice>
        </aside>
      </div>
      <DialogShell
        open={confirmSubmit}
        onOpenChange={setConfirmSubmit}
        title="Submit template to Meta"
      >
        <div className="space-y-4 p-6">
          <p className="text-sm">
            Submit the saved draft through{' '}
            {selectedAccount?.displayPhoneNumber || selectedAccount?.phoneNumberId} (business
            account {selectedAccount?.businessAccountId}) for review? This sends no customer
            messages.
          </p>
          <div className="flex gap-2">
            <button className={secondaryClass} onClick={() => setConfirmSubmit(false)}>
              Cancel
            </button>
            <button
              className={buttonClass}
              disabled={busy || !canUseAccount || dirty || !!unsupported}
              onClick={() => void providerAction('submit')}
            >
              Submit to Meta
            </button>
          </div>
        </div>
      </DialogShell>
    </div>
  );
}

function stringsOrRows(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
