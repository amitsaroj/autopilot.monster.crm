'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Merge, RefreshCw, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  duplicateService,
  type ContactDuplicateGroup,
  type CompanyDuplicateGroup,
} from '@/services/duplicate.service';

type Tab = 'contacts' | 'companies';

export default function DuplicatesPage() {
  const [tab, setTab] = useState<Tab>('contacts');
  const [loading, setLoading] = useState(true);
  const [mergingKey, setMergingKey] = useState<string | null>(null);
  const [contactGroups, setContactGroups] = useState<ContactDuplicateGroup[]>([]);
  const [companyGroups, setCompanyGroups] = useState<CompanyDuplicateGroup[]>([]);
  const [primaryByGroup, setPrimaryByGroup] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        duplicateService.findContactDuplicates(),
        duplicateService.findCompanyDuplicates(),
      ]);
      const contacts = contactsRes.data.data ?? [];
      const companies = companiesRes.data.data ?? [];
      setContactGroups(contacts);
      setCompanyGroups(companies);

      const defaults: Record<string, string> = {};
      for (const group of contacts) {
        if (group.contacts[0]) defaults[group.key] = group.contacts[0].id;
      }
      for (const group of companies) {
        if (group.companies[0]) defaults[group.key] = group.companies[0].id;
      }
      setPrimaryByGroup(defaults);
    } catch {
      toast.error('Failed to scan for duplicates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mergeContactGroup = async (group: ContactDuplicateGroup) => {
    const primaryId = primaryByGroup[group.key];
    if (!primaryId) return;
    const secondaries = group.contacts.filter((c) => c.id !== primaryId);
    if (secondaries.length === 0) return;

    setMergingKey(group.key);
    try {
      for (const secondary of secondaries) {
        await duplicateService.mergeContacts(primaryId, secondary.id);
      }
      toast.success('Contacts merged');
      await load();
    } catch {
      toast.error('Contact merge failed');
    } finally {
      setMergingKey(null);
    }
  };

  const mergeCompanyGroup = async (group: CompanyDuplicateGroup) => {
    const primaryId = primaryByGroup[group.key];
    if (!primaryId) return;
    const secondaries = group.companies.filter((c) => c.id !== primaryId);
    if (secondaries.length === 0) return;

    setMergingKey(group.key);
    try {
      for (const secondary of secondaries) {
        await duplicateService.mergeCompanies(primaryId, secondary.id);
      }
      toast.success('Companies merged');
      await load();
    } catch {
      toast.error('Company merge failed');
    } finally {
      setMergingKey(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Duplicate Merge</h1>
          <p className="text-gray-500 text-sm mt-1">
            Scan and merge duplicate contacts and companies
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Rescan
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('contacts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'contacts'
              ? 'bg-indigo-500 text-white'
              : 'bg-white/[0.04] text-gray-400 hover:text-white'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <User className="w-4 h-4" /> Contacts ({contactGroups.length})
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab('companies')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'companies'
              ? 'bg-indigo-500 text-white'
              : 'bg-white/[0.04] text-gray-400 hover:text-white'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Companies ({companyGroups.length})
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : tab === 'contacts' ? (
        <div className="space-y-6">
          {contactGroups.length === 0 ? (
            <p className="text-gray-500 text-sm py-16 text-center">No duplicate contacts found</p>
          ) : (
            contactGroups.map((group) => (
              <div
                key={group.key}
                className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Match: {group.matchFields.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Score {group.matchScore} · {group.contacts.length} records
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={mergingKey === group.key}
                    onClick={() => void mergeContactGroup(group)}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {mergingKey === group.key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Merge className="w-4 h-4" />
                    )}
                    Merge into primary
                  </button>
                </div>
                <div className="space-y-2">
                  {group.contacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.05] px-4 py-3 cursor-pointer hover:border-indigo-500/30"
                    >
                      <input
                        type="radio"
                        name={`primary-${group.key}`}
                        checked={primaryByGroup[group.key] === contact.id}
                        onChange={() =>
                          setPrimaryByGroup((prev) => ({ ...prev, [group.key]: contact.id }))
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {contact.email}
                          {contact.phone ? ` · ${contact.phone}` : ''}
                        </p>
                      </div>
                      {primaryByGroup[group.key] === contact.id && (
                        <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                          Primary
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {companyGroups.length === 0 ? (
            <p className="text-gray-500 text-sm py-16 text-center">No duplicate companies found</p>
          ) : (
            companyGroups.map((group) => (
              <div
                key={group.key}
                className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Match: {group.matchFields.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Score {group.matchScore} · {group.companies.length} records
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={mergingKey === group.key}
                    onClick={() => void mergeCompanyGroup(group)}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {mergingKey === group.key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Merge className="w-4 h-4" />
                    )}
                    Merge into primary
                  </button>
                </div>
                <div className="space-y-2">
                  {group.companies.map((company) => (
                    <label
                      key={company.id}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.05] px-4 py-3 cursor-pointer hover:border-indigo-500/30"
                    >
                      <input
                        type="radio"
                        name={`primary-${group.key}`}
                        checked={primaryByGroup[group.key] === company.id}
                        onChange={() =>
                          setPrimaryByGroup((prev) => ({ ...prev, [group.key]: company.id }))
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{company.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {company.domain || company.website || 'No domain'}
                        </p>
                      </div>
                      {primaryByGroup[group.key] === company.id && (
                        <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                          Primary
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
