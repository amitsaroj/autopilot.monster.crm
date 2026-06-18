import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contact } from '../../database/entities/contact.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Company } from '../../database/entities/company.entity';

export interface SearchResultItem {
  id: string;
  type: 'contact' | 'deal' | 'company';
  title: string;
  subtitle?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  total: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async search(tenantId: string, collection: string, query: string): Promise<SearchResponse> {
    const trimmed = query?.trim() ?? '';
    if (!trimmed) {
      return { query: trimmed, results: [], total: 0 };
    }

    const results: SearchResultItem[] = [];

    if (collection === 'all' || collection === 'contacts') {
      const contacts = await this.contactRepository
        .createQueryBuilder('contact')
        .where('contact.tenantId = :tenantId', { tenantId })
        .andWhere(
          `to_tsvector('english', coalesce(contact.first_name, '') || ' ' || coalesce(contact.last_name, '') || ' ' || coalesce(contact.email, '')) @@ plainto_tsquery('english', :query)`,
          { query: trimmed },
        )
        .take(20)
        .getMany();

      results.push(
        ...contacts.map((contact) => ({
          id: contact.id,
          type: 'contact' as const,
          title: `${contact.firstName} ${contact.lastName}`,
          subtitle: contact.email,
        })),
      );
    }

    if (collection === 'all' || collection === 'deals') {
      const deals = await this.dealRepository
        .createQueryBuilder('deal')
        .where('deal.tenantId = :tenantId', { tenantId })
        .andWhere(`to_tsvector('english', coalesce(deal.name, '')) @@ plainto_tsquery('english', :query)`, {
          query: trimmed,
        })
        .take(20)
        .getMany();

      results.push(
        ...deals.map((deal) => ({
          id: deal.id,
          type: 'deal' as const,
          title: deal.name,
          subtitle: `${deal.currency} ${deal.value}`,
        })),
      );
    }

    if (collection === 'all' || collection === 'companies') {
      const companies = await this.companyRepository
        .createQueryBuilder('company')
        .where('company.tenantId = :tenantId', { tenantId })
        .andWhere(
          `to_tsvector('english', coalesce(company.name, '') || ' ' || coalesce(company.domain, '')) @@ plainto_tsquery('english', :query)`,
          { query: trimmed },
        )
        .take(20)
        .getMany();

      results.push(
        ...companies.map((company) => ({
          id: company.id,
          type: 'company' as const,
          title: company.name,
          subtitle: company.domain,
        })),
      );
    }

    return { query: trimmed, results, total: results.length };
  }

  async index(_tenantId: string, _collection: string, _id: string, _data: Record<string, unknown>) {
    return { indexed: true };
  }
}
