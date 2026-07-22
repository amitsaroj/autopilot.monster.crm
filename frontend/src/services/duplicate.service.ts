import api from '../lib/api/client';
import type { Contact } from './contact.service';
import type { Company } from './company.service';

export interface ContactDuplicateGroup {
  key: string;
  contacts: Contact[];
  matchScore: number;
  matchFields: string[];
}

export interface CompanyDuplicateGroup {
  key: string;
  companies: Company[];
  matchScore: number;
  matchFields: string[];
}

export const duplicateService = {
  findContactDuplicates: () =>
    api.get<{ data: ContactDuplicateGroup[] }>('/crm/duplicates'),

  findCompanyDuplicates: () =>
    api.get<{ data: CompanyDuplicateGroup[] }>('/crm/duplicates/companies'),

  mergeContacts: (primaryId: string, secondaryId: string) =>
    api.post('/crm/duplicates/merge', { primaryId, secondaryId }),

  mergeCompanies: (primaryId: string, secondaryId: string) =>
    api.post('/crm/duplicates/companies/merge', { primaryId, secondaryId }),
};
