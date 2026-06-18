import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

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

    const pattern = ILike(`%${trimmed}%`);
    const results: SearchResultItem[] = [];

    if (collection === 'all' || collection === 'contacts') {
      const contacts = await this.contactRepository.find({
        where: [
          { tenantId, firstName: pattern },
          { tenantId, lastName: pattern },
          { tenantId, email: pattern },
        ],
        take: 20,
      });

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
      const deals = await this.dealRepository.find({
        where: { tenantId, name: pattern },
        take: 20,
      });

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
      const companies = await this.companyRepository.find({
        where: { tenantId, name: pattern },
        take: 20,
      });

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
