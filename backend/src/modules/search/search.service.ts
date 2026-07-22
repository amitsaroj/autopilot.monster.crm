import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contact } from '../../database/entities/contact.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Company } from '../../database/entities/company.entity';

export interface SearchIndexDocument {
  id: string;
  type: 'contact' | 'deal' | 'company';
  title: string;
  subtitle?: string;
  tenantId: string;
}

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
  private readonly logger = new Logger(SearchService.name);

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
        .andWhere(
          `to_tsvector('english', coalesce(deal.name, '')) @@ plainto_tsquery('english', :query)`,
          {
            query: trimmed,
          },
        )
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

  async index(
    tenantId: string,
    collection: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<{ indexed: boolean; document?: SearchIndexDocument }> {
    const document = await this.resolveDocument(tenantId, collection, id, data);
    if (!document) {
      return { indexed: false };
    }

    this.logger.debug(
      `Indexed ${document.type}/${document.id} for tenant ${tenantId} via PostgreSQL FTS`,
    );
    return { indexed: true, document };
  }

  async remove(tenantId: string, collection: string, id: string): Promise<{ removed: boolean }> {
    this.logger.debug(`Removed ${collection}/${id} from search index for tenant ${tenantId}`);
    return { removed: true };
  }

  private async resolveDocument(
    tenantId: string,
    collection: string,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<SearchIndexDocument | null> {
    if (payload.title && typeof payload.title === 'string') {
      return {
        id,
        type: collection as SearchIndexDocument['type'],
        title: payload.title,
        subtitle: typeof payload.subtitle === 'string' ? payload.subtitle : undefined,
        tenantId,
      };
    }

    switch (collection) {
      case 'contact': {
        const contact = await this.contactRepository.findOne({ where: { id, tenantId } });
        if (!contact) {
          return null;
        }
        return {
          id: contact.id,
          type: 'contact',
          title: `${contact.firstName} ${contact.lastName}`.trim(),
          subtitle: contact.email,
          tenantId,
        };
      }
      case 'company': {
        const company = await this.companyRepository.findOne({ where: { id, tenantId } });
        if (!company) {
          return null;
        }
        return {
          id: company.id,
          type: 'company',
          title: company.name,
          subtitle: company.domain,
          tenantId,
        };
      }
      case 'deal': {
        const deal = await this.dealRepository.findOne({ where: { id, tenantId } });
        if (!deal) {
          return null;
        }
        return {
          id: deal.id,
          type: 'deal',
          title: deal.name,
          subtitle: `${deal.currency} ${deal.value}`,
          tenantId,
        };
      }
      default:
        return null;
    }
  }
}
