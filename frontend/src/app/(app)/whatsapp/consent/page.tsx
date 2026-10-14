'use client';
import { useState } from 'react';
import {
  whatsappConsentService,
  type ConsentInput,
  type ConsentScope,
  type WhatsappPreferences,
} from '@/services/whatsapp-consent.service';
import { contactService } from '@/services/contact.service';
import { parseApiData } from '@/lib/api/parse-response';
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
}
export default function ConsentPage() {
  const records = useResource(whatsappConsentService.list);
  const contacts = useResource(
    async () =>
      parseApiData<PreferenceContact[]>(await contactService.getContacts({ limit: 100 })) ?? [],
  );
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
  const [query, setQuery] = useState('');
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState<WhatsappPreferences | null>(null);
  const [preferencesBusy, setPreferencesBusy] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [preferencesNotice, setPreferencesNotice] = useState('');
  const phoneContacts = contacts.data?.filter((contact) => contact.phone || contact.mobile) ?? [];
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
  return (
    <div className="space-y-6">
      <PageHeading
        title="Consent and preferences"
        description="Manage customer messaging preferences and record permission with evidence. Opt-outs apply to all purposes."
        action={
          <button
            className={secondaryClass}
            onClick={() => {
              void records.reload();
              void contacts.reload();
            }}
          >
            Refresh
          </button>
        }
      />
      {(error || records.error) && <Notice error>{error || records.error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
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
          <Field label="Search phone number">
            <input
              className={inputClass}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Field>
          {records.loading ? (
            <Loading />
          ) : records.data?.length ? (
            <div className="space-y-3">
              {records.data
                .filter((r) => r.phone.includes(query.replace(/\D/g, '')))
                .map((r) => (
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
