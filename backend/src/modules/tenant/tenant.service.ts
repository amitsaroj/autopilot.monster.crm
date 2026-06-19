import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import * as dns from 'dns/promises';

import { EVENT_NAMES } from '../../events/event.constants';
import { TenantRepository } from './tenant.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from '../../database/entities/tenant.entity';
import { IPaginatedResult } from '../../common/interfaces/pagination.interface';
import { TenantFilterDto } from './dto/tenant.dto';

export interface DomainVerificationResult {
  verified: boolean;
  pending: boolean;
  message?: string;
  verificationRecord: string;
}

@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findBySlug(createTenantDto.slug);
    if (existing) {
      throw new ConflictException('Tenant with this slug already exists');
    }
    const tenant = await this.tenantRepository.create(createTenantDto);
    this.eventEmitter.emit(EVENT_NAMES.TENANT_CREATED, {
      name: EVENT_NAMES.TENANT_CREATED,
      tenantId: tenant.id,
      actorId: null,
      payload: { tenantId: tenant.id, slug: tenant.slug },
      occurredAt: new Date().toISOString(),
      correlationId: uuidv4(),
    });
    return tenant;
  }

  async findAll(filter: TenantFilterDto): Promise<IPaginatedResult<Tenant>> {
    const [data, total] = await this.tenantRepository.findAll(filter);
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async update(id: string, updateTenantDto: Partial<CreateTenantDto>): Promise<Tenant> {
    await this.findOne(id);
    const tenant = await this.tenantRepository.update(id, updateTenantDto);
    this.eventEmitter.emit(EVENT_NAMES.TENANT_UPDATED, {
      name: EVENT_NAMES.TENANT_UPDATED,
      tenantId: id,
      actorId: null,
      payload: { tenantId: id, changes: updateTenantDto },
      occurredAt: new Date().toISOString(),
      correlationId: uuidv4(),
    });
    return tenant;
  }

  async suspend(id: string): Promise<Tenant> {
    await this.findOne(id);
    const tenant = await this.tenantRepository.update(id, { status: 'SUSPENDED' });
    this.eventEmitter.emit(EVENT_NAMES.TENANT_SUSPENDED, {
      name: EVENT_NAMES.TENANT_SUSPENDED,
      tenantId: id,
      actorId: null,
      payload: { tenantId: id },
      occurredAt: new Date().toISOString(),
      correlationId: uuidv4(),
    });
    return tenant;
  }

  async activate(id: string): Promise<Tenant> {
    await this.findOne(id);
    return this.tenantRepository.update(id, { status: 'ACTIVE' });
  }

  async verifyDomain(id: string, domain: string): Promise<DomainVerificationResult> {
    const existing = await this.tenantRepository.findByCustomDomain(domain);
    if (existing && existing.id !== id) {
      throw new ConflictException('Domain already in use by another tenant');
    }

    const verificationRecord = `autopilot-verify=${id}`;
    const verified = await this.checkDnsVerification(domain, verificationRecord);

    if (verified) {
      await this.tenantRepository.update(id, { customDomain: domain });
      return {
        verified: true,
        pending: false,
        message: 'Domain verified successfully',
        verificationRecord,
      };
    }

    return {
      verified: false,
      pending: true,
      message: `Add TXT record on _autopilot-verify.${domain} with value "${verificationRecord}"`,
      verificationRecord,
    };
  }

  private async checkDnsVerification(domain: string, expectedValue: string): Promise<boolean> {
    const host = `_autopilot-verify.${domain}`;
    try {
      const records = await dns.resolveTxt(host);
      const flat = records.map((parts) => parts.join(''));
      return flat.some((record) => record.includes(expectedValue));
    } catch {
      return false;
    }
  }

  async updateBranding(id: string, data: any): Promise<Tenant> {
    await this.findOne(id);
    return this.tenantRepository.update(id, { branding: data });
  }

  async getOverrides(id: string) {
    const tenant = await this.findOne(id);
    return tenant.overrides || { features: {}, limits: {} };
  }

  async updateOverrides(id: string, overrides: any) {
    await this.findOne(id);
    return this.tenantRepository.update(id, { overrides });
  }

  async removeOverrides(id: string) {
    await this.findOne(id);
    return this.tenantRepository.update(id, { overrides: undefined });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.tenantRepository.update(id, { status: 'DELETED' });
    await this.tenantRepository.softDelete(id);
  }
}
