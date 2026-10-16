'use client';
import { useEffect, useState } from 'react';
import {
  whatsappConsentService,
  type ConsentInput,
  type ConsentScope,
  type ConsentRecord,
  type ReconsentInput,
  type WhatsappPreferences,
} from '@/services/whatsapp-consent.service';
import { contactService } from '@/services/contact.service';
import { parsePaginatedResponse } from '@/lib/api/pagination';
import { parseConsentCsv, type ConsentCsvPreview } from '@/lib/whatsapp/consent-csv';
import { useResource } from '@/components/whatsapp/use-resource';
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
} from '@/components/whatsapp/ui';
interface PreferenceContact {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  mobile?: string;
  doNotContact?: boolean;
}
export default function ConsentPage() {
  const [suppressedPage, setSuppressedPage] = useState(1);
  const suppressed = useResource(() => whatsappConsentService.listSuppressed(suppressedPage));
  const reloadSuppressed = suppressed.reload;
  useEffect(() => {
    void reloadSuppressed();
  }, [suppressedPage, reloadSuppressed]);
  const [selectedSuppression, setSelectedSuppression] = useState<ConsentRecord | null>(null);
  const [reconsent, setReconsent] = useState<ReconsentInput>({
    scope: 'ALL',
    source: '',
    evidence: '',
    confirmGlobalOptOutOverride: false,
  });
  const [reconsentBusy, setReconsentBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const records = useResource(() =>
    whatsappConsentService.list({
      phone: query.trim() || undefined,
      status: (statusFilter || undefined) as ConsentInput['status'] | undefined,
      scope: (scopeFilter || undefined) as ConsentScope | undefined,
      limit: 500,
    }),
  );
  const [contactsPage, setContactsPage] = useState(1);
  const contacts = useResource(
    async () => parsePaginatedResponse<PreferenceContact>(
      await contactService.getContacts({ page: contactsPage, limit: 50 }),
    ),
  );
  const reloadContacts = contacts.reload;
  useEffect(() => {
    void reloadContacts();
  }, [contactsPage, reloadContacts]);
  const [form, setForm] = useState<ConsentInput>({
    phone: '',
    status: 'OPTED_IN',
    scope: 'MARKETING',
    source: '',
    evidence: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [csvPreview, setCsvPreview] = useState<ConsentCsvPreview | null>(null);
  const [csvBusy, setCsvBusy] = useState(false);
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState<WhatsappPreferences | null>(null);
  const [preferencesBusy, setPreferencesBusy] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [preferencesNotice, setPreferencesNotice] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [suppressionBusy, setSuppressionBusy] = useState(false);
  const saveReconsent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSuppression) return;
    setReconsentBusy(true);
    setError(null);
    setNotice('');
    try {
      await whatsappConsentService.reconsent(selectedSuppression.phone, reconsent);
      setNotice('Re-consent recorded with its source and evidence.');
      setSelectedSuppression(null);
      setReconsent({
        scope: 'ALL',
        source: '',
        evidence: '',
        confirmGlobalOptOutOverride: false,
      });
      await Promise.all([suppressed.reload(), records.reload()]);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setReconsentBusy(false);
    }
  };
  const phoneContacts = contacts.data?.data.filter((contact) => contact.phone || contact.mobile) ?? [];
  const setContactSuppression = async (doNotContact: boolean) => {
    if (!selectedContactIds.length) return;
    setSuppressionBusy(true);
    setError(null);
    setNotice('');
    try {
      const result = await whatsappConsentService.setContactSuppression(
        selectedContactIds,
        doNotContact,
      );
      setNotice(`${result?.updated ?? selectedContactIds.length} contacts updated.`);
      setSelectedContactIds([]);
      await contacts.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSuppressionBusy(false);
    }
  };
  const selectPhone = (value: string) => {
    setPhone(value);
    setPreferences(null);
    setPreferencesError(null);
    setPreferencesNotice('');
  };
  const loadPreferences = async (event: React.FormEvent) => {
    event.preventDefault();
    setPreferencesBusy(true);
    setPreferencesError(null);
    setPreferencesNotice('');
    setPreferences(null);
    try {
      const result = await whatsappConsentService.getPreferences(phone.trim());
      if (!result) throw new Error('No preferences returned');
      setPreferences(result);
    } catch (e) {
      setPreferencesError(errorMessage(e));
    } finally {
      setPreferencesBusy(false);
    }
  };
  const savePreferences = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!preferences) return;
    setPreferencesBusy(true);
    setPreferencesError(null);
    setPreferencesNotice('');
    try {
      const result = await whatsappConsentService.updatePreferences(preferences.phone, {
        timezone: preferences.timezone?.trim() || null,
        preferredLanguage: preferences.preferredLanguage?.trim() || null,
        marketingEnabled: preferences.marketingEnabled,
      });
      if (!result) throw new Error('No preferences returned');
      setPreferences(result);
      setPreferencesNotice(
        'Customer preferences saved. Consent evidence remains required for marketing.',
      );
    } catch (e) {
      setPreferencesError(errorMessage(e));
    } finally {
      setPreferencesBusy(false);
    }
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await whatsappConsentService.record({
        ...form,
        scope: form.status === 'OPTED_OUT' ? 'ALL' : form.scope,
      });
      setNotice('Consent evidence recorded. Previous records remain in the history.');
      setForm({ ...form, evidence: '' });
      await records.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const importConsentCsv = async () => {
    if (!csvPreview || csvPreview.errors.length || !csvPreview.records.length) return;
    setCsvBusy(true);
    setError(null);
    setNotice('');
    try {
      await whatsappConsentService.importRecords(csvPreview.records);
      setNotice(`${csvPreview.records.length} consent records imported atomically.`);
      setCsvPreview(null);
      await records.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setCsvBusy(false);
    }
  };
  const exportRecords = () => {
    const quote = (value: string) => {
      const safe = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safe.replaceAll('"', '""')}"`;
    };
    const csv = [
      ['Phone', 'Status', 'Scope', 'Source', 'Evidence', 'Recorded at', 'Contact ID'],
      ...(records.data ?? []).map((record) => [
        record.phone,
        record.status,
        record.scope,
        record.source,
        record.evidence ?? '',
        record.createdAt,
        record.contactId ?? '',
      ]),
    ]
      .map((row) => row.map((value) => quote(String(value))).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'whatsapp-consent-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6">
      <PageHeading
        title="Consent and preferences"
        description="Manage customer messaging preferences and record permission with evidence. Opt-outs apply to all purposes."
        action={
          <div className="flex gap-2">
            <button
              className={secondaryClass}
              onClick={() => {
                void records.reload();
                void contacts.reload();
                void suppressed.reload();
              }}
            >
              Refresh
            </button>
            <button
              className={secondaryClass}
              disabled={!records.data?.length}
              onClick={exportRecords}
            >
              Export loaded history
            </button>
          </div>
        }
      />
      {(error || records.error) && <Notice error>{error || records.error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      <section className={`${panelClass} space-y-4`} aria-labelledby="suppressed-heading">
        <div>
          <h2 id="suppressed-heading" className="text-lg font-semibold">Suppressed contacts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest active global opt-outs. A purpose-only opt-in does not clear global suppression.
          </p>
        </div>
        {suppressed.error && <Notice error>{suppressed.error}</Notice>}
        {suppressed.loading ? <Loading /> : suppressed.data?.items.length ? (
          <>
            <div className="divide-y divide-border">
              {suppressed.data.items.map((record) => (
                <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">+{record.phone}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.source} · {formatDate(record.createdAt)}
                    </p>
                    {record.evidence && <p className="text-sm">{record.evidence}</p>}
                  </div>
                  <button
                    type="button"
                    className={secondaryClass}
                    onClick={() => {
                      setSelectedSuppression(record);
                      setReconsent({ scope: 'ALL', source: '', evidence: '', confirmGlobalOptOutOverride: false });
                    }}
                  >Record re-consent</button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>{suppressed.data.total} active global opt-outs</span>
              <div className="flex gap-2">
                <button className={secondaryClass} disabled={suppressedPage <= 1} onClick={() => setSuppressedPage((p) => p - 1)}>Previous</button>
                <span className="self-center">Page {suppressedPage}</span>
                <button className={secondaryClass} disabled={suppressedPage * suppressed.data.limit >= suppressed.data.total} onClick={() => setSuppressedPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          </>
        ) : <Notice>No active global opt-outs found.</Notice>}
        {selectedSuppression && (
          <form onSubmit={(event) => void saveReconsent(event)} className="space-y-4 border-t border-border pt-4">
            <h3 className="font-medium">Record re-consent for +{selectedSuppression.phone}</h3>
            <p className="text-sm text-muted-foreground">This adds a new audit record; prior opt-out history is retained.</p>
            <Field label="Purpose">
              <select className={inputClass} value={reconsent.scope} onChange={(event) => setReconsent({ ...reconsent, scope: event.target.value as ConsentScope })}>
                {(['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'] as const).map((scope) => <option key={scope} value={scope}>{scope}</option>)}
              </select>
            </Field>
            <Field label="Source" hint="Where the customer's new permission was obtained.">
              <input required minLength={3} maxLength={200} className={inputClass} value={reconsent.source} onChange={(event) => setReconsent({ ...reconsent, source: event.target.value })} />
            </Field>
            <Field label="Evidence" hint="Required; include a reference or concise evidence of the customer's request.">
              <textarea required minLength={3} maxLength={4000} rows={3} className={inputClass} value={reconsent.evidence} onChange={(event) => setReconsent({ ...reconsent, evidence: event.target.value })} />
            </Field>
            {reconsent.scope === 'ALL' && (
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" required checked={reconsent.confirmGlobalOptOutOverride} onChange={(event) => setReconsent({ ...reconsent, confirmGlobalOptOutOverride: event.target.checked })} />
                I confirm the customer explicitly re-consented for all WhatsApp purposes; this clears the active global opt-out for future eligible sends.
              </label>
            )}
            {reconsent.scope !== 'ALL' && <p className="text-sm text-amber-700">This records purpose-specific permission. The global opt-out remains active.</p>}
            <div className="flex gap-2">
              <button className={buttonClass} disabled={reconsentBusy}>{reconsentBusy ? 'Recording…' : 'Save re-consent'}</button>
              <button type="button" className={secondaryClass} disabled={reconsentBusy} onClick={() => setSelectedSuppression(null)}>Cancel</button>
            </div>
          </form>
        )}
      </section>
      <section className={`${panelClass} space-y-4`} aria-labelledby="contact-suppression-heading">
        <div>
          <h2 id="contact-suppression-heading" className="text-lg font-semibold">
            Contact-level do-not-contact
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Suppress selected CRM contacts from WhatsApp sends, or restore eligibility only when
            appropriate. This does not create or change consent records; provider and consent
            opt-outs remain in force.
          </p>
        </div>
        {contacts.loading ? <Loading /> : contacts.error ? <Notice error>{contacts.error}</Notice> : (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonClass}
                disabled={!selectedContactIds.length || suppressionBusy}
                onClick={() => void setContactSuppression(true)}
              >
                {suppressionBusy ? 'Updating…' : `Suppress selected (${selectedContactIds.length})`}
              </button>
              <button
                type="button"
                className={secondaryClass}
                disabled={!selectedContactIds.length || suppressionBusy}
                onClick={() => void setContactSuppression(false)}
              >
                Restore selected
              </button>
              <button
                type="button"
                className={secondaryClass}
                disabled={suppressionBusy || !phoneContacts.length}
                onClick={() => {
                  const next = [...new Set([
                    ...selectedContactIds,
                    ...phoneContacts.map((contact) => contact.id),
                  ])];
                  if (next.length > 500) {
                    setError('Bulk actions are limited to 500 contacts. Clear some selections first.');
                    return;
                  }
                  setSelectedContactIds(next);
                }}
              >
                Select this page
              </button>
              <button
                type="button"
                className={secondaryClass}
                disabled={!selectedContactIds.length || suppressionBusy}
                onClick={() => setSelectedContactIds([])}
              >
                Clear selection
              </button>
            </div>
            <div className="divide-y divide-border rounded-lg border border-border">
              {phoneContacts.map((contact) => (
                <label key={contact.id} className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={selectedContactIds.includes(contact.id)}
                    disabled={suppressionBusy || (selectedContactIds.length >= 500 && !selectedContactIds.includes(contact.id))}
                    onChange={(event) => setSelectedContactIds((current) =>
                      event.target.checked
                        ? [...new Set([...current, contact.id])]
                        : current.filter((id) => id !== contact.id),
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{contact.firstName} {contact.lastName}</span>
                    <span className="block text-sm text-muted-foreground">{contact.phone || contact.mobile}</span>
                  </span>
                  <StatusBadge value={contact.doNotContact ? 'SUPPRESSED' : 'ELIGIBLE'} />
                </label>
              ))}
              {!phoneContacts.length && <p className="p-4 text-sm text-muted-foreground">No phone-enabled CRM contacts in the loaded contact list.</p>}
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>{selectedContactIds.length}/500 selected · {contacts.data?.meta.total ?? 0} contacts</span>
              <div className="flex items-center gap-2">
                <button type="button" className={secondaryClass} disabled={contactsPage <= 1 || contacts.loading} onClick={() => setContactsPage((page) => page - 1)}>Previous</button>
                <span>Page {contactsPage}</span>
                <button type="button" className={secondaryClass} disabled={contactsPage >= (contacts.data?.meta.totalPages ?? 0) || contacts.loading} onClick={() => setContactsPage((page) => page + 1)}>Next</button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Select across pages, up to 500 contacts per action. Global WhatsApp opt-outs cannot be cleared here.</p>
          </>
        )}
      </section>
      <section className={`${panelClass} space-y-4`} aria-labelledby="consent-import-heading">
        <div>
          <h2 id="consent-import-heading" className="text-lg font-semibold">
            Import consent history
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            CSV columns: phone, status, scope, source, evidence. Every opt-in requires explicit
            evidence; unknown or missing consent is never converted to permission. Imports are
            limited to 500 rows and commit as one transaction.
          </p>
        </div>
        <Field
          label="Consent CSV"
          hint="Maximum 1 MB. Duplicate phone numbers must be resolved first."
        >
          <input
            type="file"
            accept=".csv,text/csv"
            className={inputClass}
            disabled={csvBusy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              setCsvPreview(null);
              if (!file) return;
              if (file.size > 1_000_000) {
                setCsvPreview({ records: [], errors: ['CSV must be no larger than 1 MB'] });
                return;
              }
              try {
                setCsvPreview(parseConsentCsv(await file.text()));
              } catch {
                setCsvPreview({ records: [], errors: ['Could not read the selected CSV file'] });
              }
            }}
          />
        </Field>
        {csvPreview && (
          <div className="space-y-3" aria-live="polite">
            {csvPreview.errors.length ? (
              <Notice error>
                <ul className="list-inside list-disc">
                  {csvPreview.errors.slice(0, 12).map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
                {csvPreview.errors.length > 12 && (
                  <p>And {csvPreview.errors.length - 12} more row errors.</p>
                )}
              </Notice>
            ) : (
              <>
                <p className="text-sm" role="status">
                  {csvPreview.records.length} rows are valid. Review the sample before importing.
                </p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="p-2">Phone</th>
                        <th className="p-2">Decision</th>
                        <th className="p-2">Scope</th>
                        <th className="p-2">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.records.slice(0, 5).map((record) => (
                        <tr key={record.phone} className="border-t border-border">
                          <td className="p-2">{record.phone}</td>
                          <td className="p-2">{record.status}</td>
                          <td className="p-2">{record.scope}</td>
                          <td className="p-2">{record.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className={buttonClass}
                  disabled={csvBusy}
                  onClick={() => void importConsentCsv()}
                >
                  {csvBusy ? 'Importing…' : `Import ${csvPreview.records.length} records`}
                </button>
              </>
            )}
          </div>
        )}
      </section>
      <section className={`${panelClass} space-y-4`} aria-labelledby="preferences-heading">
        <div>
          <h2 id="preferences-heading" className="text-lg font-semibold">
            Customer preferences
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose an existing workspace contact or enter their international phone number.
          </p>
        </div>
        {preferencesError && <Notice error>{preferencesError}</Notice>}
        {preferencesNotice && <Notice>{preferencesNotice}</Notice>}
        <form onSubmit={(event) => void loadPreferences(event)}>
          <fieldset
            disabled={preferencesBusy}
            className="grid items-end gap-4 md:grid-cols-[1fr_1fr_auto]"
          >
            <Field
              label="Workspace contact"
              hint={
                contacts.loading
                  ? 'Loading contacts…'
                  : 'Up to 100 contacts. Enter another phone number to look it up.'
              }
            >
              <select
                className={inputClass}
                value={
                  phoneContacts.some((contact) => (contact.phone || contact.mobile) === phone)
                    ? phone
                    : ''
                }
                onChange={(event) => selectPhone(event.target.value)}
              >
                <option value="">Choose a contact</option>
                {phoneContacts.map((contact) => (
                  <option key={contact.id} value={contact.phone || contact.mobile}>
                    {contact.firstName} {contact.lastName} · {contact.phone || contact.mobile}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Customer phone number">
              <input
                type="tel"
                required
                minLength={8}
                maxLength={30}
                className={inputClass}
                value={phone}
                onChange={(event) => selectPhone(event.target.value)}
                placeholder="+ country code and phone number"
              />
            </Field>
            <button className={secondaryClass} disabled={!phone.trim() || preferencesBusy}>
              {preferencesBusy ? 'Working…' : 'Load preferences'}
            </button>
          </fieldset>
        </form>
        {contacts.error && (
          <Notice error>
            {contacts.error} You can still look up an existing contact by phone number.
          </Notice>
        )}
        {preferences && (
          <form
            onSubmit={(event) => void savePreferences(event)}
            className="space-y-4 border-t border-border pt-4"
          >
            <p className="text-sm font-medium">Preferences for +{preferences.phone}</p>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm" role="status">
              <p>
                Recorded marketing consent:{' '}
                <strong>
                  {preferences.marketingConsentStatus === 'UNKNOWN'
                    ? 'Unknown — opt-in required'
                    : preferences.marketingConsentStatus === 'OPTED_IN'
                      ? 'Opted in'
                      : 'Opted out'}
                </strong>
              </p>
              {preferences.suppressed && (
                <p className="mt-1 text-destructive">
                  Marketing is suppressed by an opt-out or contact do-not-contact setting.
                </p>
              )}
              <p className="mt-1 text-muted-foreground">
                Enabling the marketing preference does not record consent or override suppression.
              </p>
            </div>
            <fieldset disabled={preferencesBusy} className="grid gap-4 md:grid-cols-2">
              <Field
                label="Timezone"
                hint="Use an IANA timezone, such as Asia/Kolkata. Leave blank to clear."
              >
                <input
                  className={inputClass}
                  maxLength={100}
                  value={preferences.timezone ?? ''}
                  onChange={(event) =>
                    setPreferences({ ...preferences, timezone: event.target.value })
                  }
                  placeholder="Asia/Kolkata"
                />
              </Field>
              <Field
                label="Preferred language"
                hint="Use a language locale, such as en-IN, hi or zh-Hant. Leave blank to clear."
              >
                <input
                  className={inputClass}
                  maxLength={80}
                  value={preferences.preferredLanguage ?? ''}
                  onChange={(event) =>
                    setPreferences({ ...preferences, preferredLanguage: event.target.value })
                  }
                  placeholder="en-IN"
                />
              </Field>
              <Field
                label="Marketing messaging"
                hint="Disabling blocks marketing even with recorded consent. Enabling still requires consent and respects opt-outs."
              >
                <select
                  className={inputClass}
                  value={preferences.marketingEnabled ? 'enabled' : 'disabled'}
                  onChange={(event) =>
                    setPreferences({
                      ...preferences,
                      marketingEnabled: event.target.value === 'enabled',
                    })
                  }
                >
                  <option value="enabled">Enabled, subject to consent</option>
                  <option value="disabled">Disabled</option>
                </select>
              </Field>
            </fieldset>
            <button className={buttonClass} disabled={preferencesBusy}>
              {preferencesBusy ? 'Saving…' : 'Save preferences'}
            </button>
          </form>
        )}
      </section>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <form className={`${panelClass} space-y-4 self-start`} onSubmit={(e) => void save(e)}>
          <Field label="International phone number">
            <input
              type="tel"
              required
              minLength={8}
              maxLength={30}
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+ country code and phone number"
            />
          </Field>
          <Field label="Decision">
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ConsentInput['status'] })
              }
            >
              <option value="OPTED_IN">Opted in</option>
              <option value="OPTED_OUT">Opted out</option>
            </select>
          </Field>
          <Field label="Purpose">
            <select
              className={inputClass}
              disabled={form.status === 'OPTED_OUT'}
              value={form.status === 'OPTED_OUT' ? 'ALL' : form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value as ConsentScope })}
            >
              {['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Source"
            hint="Where permission was obtained, such as a signed form or a customer request."
          >
            <input
              required
              minLength={3}
              maxLength={200}
              className={inputClass}
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
          </Field>
          <Field label="Evidence">
            <textarea
              maxLength={4000}
              rows={3}
              className={inputClass}
              value={form.evidence}
              onChange={(e) => setForm({ ...form, evidence: e.target.value })}
            />
          </Field>
          <button className={buttonClass} disabled={busy}>
            {busy ? 'Recording…' : 'Record decision'}
          </button>
        </form>
        <section className="space-y-4">
          <form
            className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void records.reload();
            }}
          >
            <Field label="Search phone number">
              <input
                className={inputClass}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </Field>
            <Field label="Status">
              <select
                className={inputClass}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="OPTED_IN">Opted in</option>
                <option value="OPTED_OUT">Opted out</option>
              </select>
            </Field>
            <Field label="Purpose">
              <select
                className={inputClass}
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
              >
                <option value="">All purposes</option>
                {(['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'] as const).map((scope) => (
                  <option key={scope} value={scope}>
                    {scope}
                  </option>
                ))}
              </select>
            </Field>
            <button className={`${secondaryClass} self-end`}>Apply</button>
          </form>
          <p className="text-xs text-muted-foreground">
            Showing at most 500 matching records. Export includes the currently loaded results.
          </p>
          {records.loading ? (
            <Loading />
          ) : records.data?.length ? (
            <div className="space-y-3">
              {records.data.map((r) => (
                <article className={panelClass} key={r.id}>
                  <div className="flex justify-between gap-3">
                    <h2 className="font-medium">+{r.phone}</h2>
                    <StatusBadge value={r.status} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {r.scope} · {r.source} · {formatDate(r.createdAt)}
                  </p>
                  {r.evidence && <p className="mt-2 whitespace-pre-wrap text-sm">{r.evidence}</p>}
                  <button
                    type="button"
                    disabled={preferencesBusy}
                    className={`${secondaryClass} mt-3`}
                    onClick={() => selectPhone(r.phone)}
                  >
                    Edit customer preferences
                  </button>
                </article>
              ))}
            </div>
          ) : (
            !records.error && (
              <Notice>
                No consent records yet. Record evidence before initiating customer outreach.
              </Notice>
            )
          )}
        </section>
      </div>
    </div>
  );
}
