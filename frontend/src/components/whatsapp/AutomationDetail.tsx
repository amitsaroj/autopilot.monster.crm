'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  whatsappAutomationService,
  type AutomationInstallation,
  type AutomationPreview,
} from '@/services/whatsapp-automation.service';
import { whatsappAccountService } from '@/services/whatsapp-account.service';
import {
  whatsappTemplateService,
  type WhatsappTemplate,
} from '@/services/whatsapp-template.service';
import { userService, type User } from '@/services/user.service';
import { aiAgentService } from '@/services/ai-agent.service';
import { knowledgeBaseService } from '@/services/knowledge-base.service';
import { contactService, type Contact } from '@/services/contact.service';
import { parseApiData } from '@/lib/api/parse-response';
import { useResource } from './use-resource';
import { automationPrice } from './AutomationCatalog';
import { templateParameterKeys } from './template-utils';
import {
  PageHeading,
  Notice,
  Loading,
  Field,
  StatusBadge,
  inputClass,
  buttonClass,
  secondaryClass,
  panelClass,
  errorMessage,
} from './ui';

export default function AutomationDetail({
  slug,
  publicView = false,
}: {
  slug: string;
  publicView?: boolean;
}) {
  const product = useResource(() => whatsappAutomationService.detail(slug));
  const resources = useResource(async () => {
    if (publicView) return null;
    const p = await whatsappAutomationService.detail(slug);
    const [installations, accounts, templates, users, agents, knowledgeBases, contacts] =
      await Promise.all([
        whatsappAutomationService.installed(),
        whatsappAccountService.list(),
        p.configSchema.fields.some((field) => field.type === 'template')
          ? whatsappTemplateService
              .list()
              .then((response) => parseApiData<WhatsappTemplate[]>(response) ?? [])
          : Promise.resolve([]),
        p.configSchema.fields.some((field) => field.key === 'assigneeId')
          ? userService.getUsers().then((response) => parseApiData<User[]>(response) ?? [])
          : Promise.resolve([]),
        p.configSchema.fields.some((field) => field.key === 'agentId')
          ? aiAgentService
              .list()
              .then(
                (response) =>
                  parseApiData<{ id: string; name: string; isActive: boolean }[]>(response) ?? [],
              )
          : Promise.resolve([]),
        p.configSchema.fields.some((field) => field.key === 'knowledgeBaseId')
          ? knowledgeBaseService.list().then((response) => response.data)
          : Promise.resolve([]),
        p.trigger === 'MANUAL'
          ? contactService.getContacts().then((response) => parseApiData<Contact[]>(response) ?? [])
          : Promise.resolve([]),
      ]);
    return {
      installation: installations.find((row) => row.slug === slug),
      accounts,
      templates,
      users,
      agents,
      knowledgeBases,
      contacts,
    };
  });
  const [installation, setInstallation] = useState<AutomationInstallation | undefined>();
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [payload, setPayload] = useState('{\n  "phone": "",\n  "body": ""\n}');
  const [preview, setPreview] = useState<AutomationPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [contactId, setContactId] = useState('');
  const [confirmRun, setConfirmRun] = useState(false);
  const [previewPhone, setPreviewPhone] = useState('');
  const [previewBody, setPreviewBody] = useState('');
  const manualRequest = useRef<string | null>(null);
  useEffect(() => {
    if (!resources.data) return;
    const installed = resources.data.installation;
    setInstallation(installed);
    setConfig(installed?.config ?? {});
    setDirty(false);
  }, [resources.data]);

  async function perform(work: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await work();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  function change(key: string, value: unknown) {
    manualRequest.current = null;
    setConfig((current) => ({
      ...current,
      [key]: value,
      ...(key === 'templateId' ? { templateParameters: '[]' } : {}),
    }));
    setDirty(true);
    setPreview(null);
    setSuccess(null);
  }
  async function save() {
    const result =
      installation && installation.state !== 'UNINSTALLED'
        ? await whatsappAutomationService.configure(installation.id, config)
        : await whatsappAutomationService.install(slug, config);
    setInstallation(result);
    setConfig(result.config);
    setDirty(false);
    setSuccess('Configuration saved as a draft. Preview it before activation.');
  }
  async function test() {
    let value: unknown;
    const contact = resources.data?.contacts.find((entry) => entry.id === contactId);
    if (product.data?.trigger === 'MANUAL' && !contact) {
      setError('Choose a preview contact.');
      return;
    }
    try {
      value =
        product.data?.trigger === 'WHATSAPP_KEYWORD'
          ? { phone: previewPhone, body: previewBody }
          : product.data?.trigger === 'MANUAL' && contact
            ? {
                contact: { ...contact, phone: contact.mobile || contact.phone },
                phone: contact.mobile || contact.phone,
              }
            : JSON.parse(payload);
    } catch {
      setError('Preview data must be valid JSON.');
      return;
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      setError('Preview data must be a JSON object.');
      return;
    }
    const result = await whatsappAutomationService.preview(
      slug,
      config,
      value as Record<string, unknown>,
    );
    setPreview(result);
  }
  async function checkout() {
    const result = await whatsappAutomationService.checkout(slug);
    const url = new URL(result.url);
    if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com')
      throw new Error('Invalid checkout URL');
    window.location.assign(url.href);
  }

  async function run() {
    if (!installation || !contactId) return;
    manualRequest.current ??= crypto.randomUUID();
    await whatsappAutomationService.run(installation.id, { contactId }, manualRequest.current);
    setConfirmRun(false);
    setSuccess(
      'Execution queued. Review its result in execution history before starting another send.',
    );
  }

  if (product.loading) return <Loading />;
  if (product.error || !product.data)
    return <Notice error>{product.error || 'Automation not found.'}</Notice>;
  const p = product.data;
  const available = p.availability === 'IMPLEMENTED' && !!p.id;
  const active = installation?.state === 'ACTIVE';
  const requiresPayment =
    p.pricing.model === 'PAID' &&
    (!installation ||
      installation.readiness.issues.some((issue) => issue.code === 'PAYMENT_REQUIRED'));
  const parameterKeys = templateParameterKeys(
    resources.data?.templates.find((template) => template.id === config.templateId),
  );
  let parameterValues: string[] = [];
  try {
    const parsed: unknown = JSON.parse(String(config.templateParameters ?? '[]'));
    if (Array.isArray(parsed) && parsed.every((value) => typeof value === 'string'))
      parameterValues = parsed;
  } catch {
    /* Show empty parameter fields for configuration requiring repair. */
  }
  return (
    <div className="space-y-6">
      <PageHeading
        title={p.name}
        description={p.description}
        action={
          <Link
            className={secondaryClass}
            href={publicView ? '/product/whatsapp/automations' : '/whatsapp/automations'}
          >
            Back to catalog
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className={panelClass}>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge value={p.availability} />
              <span className="text-xs text-muted-foreground">Version {p.version}</span>
            </div>
            <h2 className="mt-4 font-semibold">What happens</h2>
            {p.steps.length > 0 ? (
              <ol className="mt-3 space-y-2">
                {p.steps.map((step, index) => (
                  <li key={step} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                This product requires an integration before it can be installed.
              </p>
            )}
          </section>
          {publicView ? (
            <Link className={buttonClass} href={`/whatsapp/automations/${p.slug}`}>
              Sign in to configure
            </Link>
          ) : (
            <>
              {resources.loading && <Loading />}
              {resources.error && (
                <Notice error>
                  {resources.error}{' '}
                  <button className="underline" onClick={() => void resources.reload()}>
                    Reload prerequisites
                  </button>
                </Notice>
              )}
              {error && <Notice error>{error}</Notice>}
              {success && <Notice>{success}</Notice>}
              {p.trigger === 'MANUAL' && installation?.state === 'ACTIVE' && resources.data && (
                <section className={`${panelClass} space-y-4`}>
                  <h2 className="font-semibold">Run for one contact</h2>
                  <Field
                    label="Workspace contact"
                    hint="Consent and template eligibility are rechecked when the message is sent."
                  >
                    <select
                      className={inputClass}
                      value={contactId}
                      disabled={busy}
                      onChange={(event) => {
                        setContactId(event.target.value);
                        manualRequest.current = null;
                        setConfirmRun(false);
                      }}
                    >
                      {<option value="">Select a contact</option>}
                      {resources.data.contacts
                        .filter((contact) => contact.mobile || contact.phone)
                        .map((contact) => (
                          <option key={contact.id} value={contact.id}>
                            {contact.firstName} {contact.lastName} ·{' '}
                            {contact.mobile || contact.phone}
                          </option>
                        ))}
                    </select>
                  </Field>
                  {confirmRun ? (
                    <Notice>
                      This starts a real workflow execution for the selected contact.{' '}
                      <button
                        className="underline"
                        disabled={busy}
                        onClick={() => void perform(run)}
                      >
                        Confirm send
                      </button>{' '}
                      <button
                        className="underline"
                        disabled={busy}
                        onClick={() => setConfirmRun(false)}
                      >
                        Cancel
                      </button>
                    </Notice>
                  ) : (
                    <button
                      className={buttonClass}
                      disabled={busy || !contactId || dirty}
                      onClick={() => setConfirmRun(true)}
                    >
                      Review send
                    </button>
                  )}
                </section>
              )}
              {available && resources.data && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void perform(save);
                  }}
                  className={`${panelClass} space-y-4`}
                >
                  <h2 className="font-semibold">Configure your automation</h2>
                  {active && (
                    <Notice>
                      Saving changes pauses this automation and returns it to draft. Review and
                      activate the new configuration when ready.
                    </Notice>
                  )}
                  {p.configSchema.fields.map((field) => (
                    <Field key={field.key} label={field.label} hint={field.description}>
                      {field.key === 'accountId' ? (
                        <select
                          required={field.required}
                          disabled={busy}
                          className={inputClass}
                          value={String(config[field.key] ?? '')}
                          onChange={(event) => change(field.key, event.target.value)}
                        >
                          <option value="">Select connected account</option>
                          {resources.data?.accounts
                            .filter((account) => account.status === 'CONNECTED')
                            .map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.displayPhoneNumber || account.phoneNumberId}
                              </option>
                            ))}
                        </select>
                      ) : field.type === 'template' ? (
                        <select
                          required={field.required}
                          disabled={busy}
                          className={inputClass}
                          value={String(config[field.key] ?? '')}
                          onChange={(event) => change(field.key, event.target.value)}
                        >
                          <option value="">Select approved template</option>
                          {resources.data?.templates
                            .filter(
                              (template) => template.status === 'APPROVED' && template.waTemplateId,
                            )
                            .map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name} · {template.language} · {template.category}
                              </option>
                            ))}
                        </select>
                      ) : field.key === 'assigneeId' ? (
                        <select
                          required={field.required}
                          disabled={busy}
                          className={inputClass}
                          value={String(config[field.key] ?? '')}
                          onChange={(event) => change(field.key, event.target.value)}
                        >
                          <option value="">Select teammate</option>
                          {resources.data?.users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} · {user.email}
                            </option>
                          ))}
                        </select>
                      ) : field.key === 'templateParameters' ? (
                        <div className="space-y-2">
                          {parameterKeys.length ? (
                            parameterKeys.map((key, index) => (
                              <div key={key}>
                                <span className="text-xs text-muted-foreground">
                                  Parameter {key}
                                </span>
                                <input
                                  aria-label={`Template parameter ${key}`}
                                  required
                                  disabled={busy}
                                  className={inputClass}
                                  value={parameterValues[index] ?? ''}
                                  onChange={(event) => {
                                    const values = parameterKeys.map((_key, position) =>
                                      position === index
                                        ? event.target.value
                                        : (parameterValues[position] ?? ''),
                                    );
                                    change(field.key, JSON.stringify(values));
                                  }}
                                />
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Choose a template. Templates without variables do not need parameters.
                            </p>
                          )}
                        </div>
                      ) : field.type === 'message' ? (
                        <textarea
                          required={field.required}
                          disabled={busy}
                          maxLength={field.maxLength}
                          rows={3}
                          className={inputClass}
                          value={String(config[field.key] ?? '')}
                          onChange={(event) => change(field.key, event.target.value)}
                        />
                      ) : field.key === 'recipient' ? (
                        <select
                          required
                          disabled={busy}
                          className={inputClass}
                          value={String(config[field.key] ?? '')}
                          onChange={(event) => change(field.key, event.target.value)}
                        >
                          <option value="">Select recipient field</option>
                          {(p.trigger === 'DEAL_STAGE_CHANGED'
                            ? ['deal.contact.phone']
                            : ['phone', 'contact.phone']
                          ).map((path) => (
                            <option key={path} value={path}>
                              {path === 'phone'
                                ? 'Selected contact’s WhatsApp number'
                                : path === 'contact.phone'
                                  ? 'CRM contact phone'
                                  : 'Deal contact phone'}
                            </option>
                          ))}
                        </select>
                      ) : field.key === 'agentId' || field.key === 'knowledgeBaseId' ? (
                        <select
                          required={field.required}
                          disabled={busy}
                          className={inputClass}
                          value={String(config[field.key] ?? '')}
                          onChange={(event) => change(field.key, event.target.value)}
                        >
                          <option value="">Select {field.label.toLowerCase()}</option>
                          {(field.key === 'agentId'
                            ? resources.data?.agents.filter((agent) => agent.isActive)
                            : resources.data?.knowledgeBases
                          )?.map((resource) => (
                            <option key={resource.id} value={resource.id}>
                              {resource.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          required={field.required}
                          disabled={busy}
                          type={
                            field.type === 'integer'
                              ? 'number'
                              : field.type === 'url'
                                ? 'url'
                                : 'text'
                          }
                          min={field.minimum}
                          max={field.maximum}
                          maxLength={field.maxLength}
                          className={inputClass}
                          value={String(config[field.key] ?? '')}
                          onChange={(event) =>
                            change(
                              field.key,
                              field.type === 'integer' && event.target.value !== ''
                                ? Number(event.target.value)
                                : event.target.value,
                            )
                          }
                        />
                      )}
                    </Field>
                  ))}
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" className={buttonClass} disabled={busy}>
                      {busy
                        ? 'Working…'
                        : installation && installation.state !== 'UNINSTALLED'
                          ? 'Save draft'
                          : 'Install as draft'}
                    </button>
                    {requiresPayment && (
                      <button
                        type="button"
                        className={secondaryClass}
                        disabled={busy || !p.pricing.checkoutAvailable}
                        onClick={() => void perform(checkout)}
                      >
                        Purchase via Stripe
                      </button>
                    )}
                  </div>
                  {requiresPayment && (
                    <Notice>
                      {p.pricing.checkoutAvailable
                        ? 'Complete checkout before installation. Access is granted after payment confirmation.'
                        : 'Purchase is unavailable until billing is configured for this product.'}
                    </Notice>
                  )}
                </form>
              )}
              {available && resources.data && (
                <section className={`${panelClass} space-y-4`}>
                  <h2 className="font-semibold">Preview without sending</h2>
                  {p.trigger === 'WHATSAPP_KEYWORD' ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Example customer number"
                        hint="Used only in this preview; no message is sent."
                      >
                        <input
                          className={inputClass}
                          value={previewPhone}
                          onChange={(event) => {
                            setPreviewPhone(event.target.value);
                            setPreview(null);
                          }}
                        />
                      </Field>
                      <Field label="Example incoming message">
                        <input
                          className={inputClass}
                          value={previewBody}
                          onChange={(event) => {
                            setPreviewBody(event.target.value);
                            setPreview(null);
                          }}
                        />
                      </Field>
                    </div>
                  ) : p.trigger === 'MANUAL' ? (
                    <Field
                      label="Preview contact"
                      hint="Preview uses existing CRM data without sending."
                    >
                      <select
                        className={inputClass}
                        value={contactId}
                        onChange={(event) => {
                          setContactId(event.target.value);
                          manualRequest.current = null;
                          setPreview(null);
                        }}
                      >
                        <option value="">Select contact</option>
                        {resources.data.contacts
                          .filter((contact) => contact.mobile || contact.phone)
                          .map((contact) => (
                            <option key={contact.id} value={contact.id}>
                              {contact.firstName} {contact.lastName}
                            </option>
                          ))}
                      </select>
                    </Field>
                  ) : (
                    <Field
                      label="Example trigger data"
                      hint="Use sample data containing the variables referenced by your configuration. This preview executes no actions."
                    >
                      <textarea
                        className={`${inputClass} font-mono`}
                        rows={5}
                        value={payload}
                        onChange={(event) => {
                          setPayload(event.target.value);
                          setPreview(null);
                        }}
                      />
                    </Field>
                  )}
                  <button
                    className={secondaryClass}
                    disabled={busy}
                    onClick={() => void perform(test)}
                  >
                    Validate and preview
                  </button>
                  {preview && (
                    <div className="space-y-3">
                      <StatusBadge
                        value={preview.valid ? 'Preview valid' : 'Preview needs changes'}
                      />
                      {preview.errors.map((message) => (
                        <Notice error key={message}>
                          {message}
                        </Notice>
                      ))}
                      {preview.warnings?.map((message) => (
                        <Notice key={message}>{message}</Notice>
                      ))}
                      {preview.readiness.issues.map((issue) => (
                        <Notice key={`${issue.code}-${issue.field}`}>{issue.message}</Notice>
                      ))}
                      {preview.preview?.map((step) => (
                        <div key={step.stepId} className="rounded-lg border border-border p-3">
                          <p className="text-sm font-medium">{step.type.replaceAll('_', ' ')}</p>
                          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                            {JSON.stringify(step.config, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
        <aside className="space-y-6">
          <section className={`${panelClass} space-y-4`}>
            <h2 className="font-semibold">Prerequisites and pricing</h2>
            <p className="text-sm">{automationPrice(p)}</p>
            <p className="text-xs text-muted-foreground">
              Required plan features: {p.requiredFeatures.join(', ')}. Provider messaging charges
              and external service fees are separate.
            </p>
            {p.externalRequirements.map((requirement) => (
              <div key={requirement.key}>
                <p className="text-sm font-medium">
                  {requirement.label}
                  {!requirement.implemented && ' · not available'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{requirement.description}</p>
              </div>
            ))}
            {!available && (
              <Notice>
                Installation is unavailable until the required integration or catalog configuration
                is complete.
              </Notice>
            )}
            <div className="flex flex-wrap gap-2">
              <Link className={secondaryClass} href="/whatsapp/settings">
                Connect account
              </Link>
              <Link className={secondaryClass} href="/whatsapp/templates">
                Manage templates
              </Link>
              <Link className={secondaryClass} href="/billing">
                Plan and usage
              </Link>
            </div>
          </section>
          {!publicView && installation && (
            <section className={`${panelClass} space-y-4`}>
              <h2 className="font-semibold">Workspace installation</h2>
              <StatusBadge value={installation.state} />
              {installation.readiness.issues.map((issue) => (
                <Notice key={`${issue.code}-${issue.field}`}>{issue.message}</Notice>
              ))}
              <p className="text-sm text-muted-foreground">
                {installation.analytics.total} executions · {installation.analytics.completed}{' '}
                completed · {installation.analytics.failed} failed
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className={buttonClass}
                  disabled={
                    busy ||
                    active ||
                    dirty ||
                    installation.state === 'UNINSTALLED' ||
                    !installation.readiness.ready ||
                    !preview?.valid
                  }
                  onClick={() =>
                    void perform(async () => {
                      setInstallation(await whatsappAutomationService.activate(installation.id));
                      setSuccess('Automation activated.');
                    })
                  }
                >
                  Activate
                </button>
                <button
                  className={secondaryClass}
                  disabled={busy || installation.state !== 'ACTIVE'}
                  onClick={() =>
                    void perform(async () => {
                      setInstallation(await whatsappAutomationService.disable(installation.id));
                      setSuccess('Automation paused.');
                    })
                  }
                >
                  Pause
                </button>
                <Link
                  className={secondaryClass}
                  href={`/whatsapp/automations/installed/${installation.id}`}
                >
                  Execution history
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Save configuration and run a valid preview before activation. Activation rechecks
                connection, template approval and subscription eligibility.
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
