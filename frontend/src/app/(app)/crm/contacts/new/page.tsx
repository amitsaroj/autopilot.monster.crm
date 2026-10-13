'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { contactService } from '@/services/contact.service';
import { companyService } from '@/services/company.service';
import { parsePaginatedResponse } from '@/lib/api/pagination';
import { parseApiData } from '@/lib/api/parse-response';

type CompanyOption = { id: string; name: string };
const fields = [
  { key: 'firstName', label: 'First name', required: true, type: 'text' },
  { key: 'lastName', label: 'Last name', required: true, type: 'text' },
  { key: 'email', label: 'Email address', required: true, type: 'email' },
  { key: 'phone', label: 'Phone', required: false, type: 'tel' },
  { key: 'jobTitle', label: 'Job title', required: false, type: 'text' },
  { key: 'department', label: 'Department', required: false, type: 'text' },
] as const;

export default function NewContactPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    companyId: '',
    leadSource: 'Website',
  });
  useEffect(() => {
    void companyService
      .getCompanies({ page: 1, limit: 100 })
      .then((response) => setCompanies(parsePaginatedResponse<CompanyOption>(response).data))
      .catch(() =>
        toast.error(
          'Companies could not be loaded. You can still create a contact without a company.',
        ),
      )
      .finally(() => setCompaniesLoading(false));
  }, []);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        jobTitle: form.jobTitle,
        ...(form.companyId ? { companyId: form.companyId } : {}),
        leadSource: form.leadSource,
        customFields: { department: form.department },
      };
      const response = await contactService.createContact(payload);
      const result = parseApiData<{ id: string }>(response);
      toast.success('Contact created');
      router.push(result?.id ? `/crm/contacts/${result.id}` : '/crm/contacts');
    } catch {
      toast.error('Unable to create the contact. Check the details and try again.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/crm/contacts"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Contacts
      </Link>
      <div>
        <h1 className="page-title">New contact</h1>
        <p className="page-description">Add contact details and connect them to a company.</p>
      </div>
      <form onSubmit={submit} className="product-panel p-5 sm:p-8 space-y-8">
        <section>
          <h2 className="font-semibold mb-5">Contact details</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {fields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`new-contact-${field.key}`}
                  className="block text-sm font-medium mb-2"
                >
                  {field.label}
                  {field.required && <span className="text-muted-foreground"> *</span>}
                </label>
                <input
                  id={`new-contact-${field.key}`}
                  required={field.required}
                  type={field.type}
                  value={form[field.key]}
                  disabled={saving}
                  maxLength={field.key === 'phone' ? 30 : field.key === 'jobTitle' ? 200 : 100}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
            ))}
          </div>
        </section>
        <section className="border-t border-border pt-6">
          <h2 className="font-semibold mb-5">Company and source</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="new-contact-company" className="block text-sm font-medium mb-2">
                Company
              </label>
              <select
                id="new-contact-company"
                disabled={saving || companiesLoading}
                value={form.companyId}
                onChange={(event) => setForm({ ...form, companyId: event.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">{companiesLoading ? 'Loading companies…' : 'No company'}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <Link href="/crm/companies/new" className="inline-flex text-xs mt-2 text-primary">
                Create a company
              </Link>
            </div>
            <div>
              <label htmlFor="new-contact-source" className="block text-sm font-medium mb-2">
                Lead source
              </label>
              <select
                id="new-contact-source"
                disabled={saving}
                value={form.leadSource}
                onChange={(event) => setForm({ ...form, leadSource: event.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                {[
                  'Website',
                  'LinkedIn',
                  'Referral',
                  'Cold Outreach',
                  'Event',
                  'Partner',
                  'Other',
                ].map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>
        </section>
        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <button
            disabled={saving}
            className="product-button product-button-primary disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create contact
          </button>
          <Link href="/crm/contacts" className="product-button product-button-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
