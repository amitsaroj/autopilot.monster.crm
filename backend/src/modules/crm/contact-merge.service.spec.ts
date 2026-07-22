import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ContactService } from './contact.service';
import { ContactRepository } from './contact.repository';
import { DealService } from './deal.service';
import { Activity } from '../../database/entities/activity.entity';
import { Note } from '../../database/entities/note.entity';
import { EmailMessage } from '../../database/entities/email-message.entity';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { Contact, ContactStatus } from '../../database/entities/contact.entity';
import { toPaginatedResult, wantsPagination } from '../../common/utils/pagination.util';
import { CompanyService } from './company.service';
import { CompanyRepository } from './company.repository';
import { Company } from '../../database/entities/company.entity';
import { Deal } from '../../database/entities/deal.entity';

describe('CRM backend hardening helpers', () => {
  it('builds pagination meta', () => {
    const result = toPaginatedResult([{ id: 1 }], 25, 2, 10);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      nextPage: 3,
      prevPage: 1,
    });
  });

  it('detects explicit pagination query', () => {
    expect(wantsPagination({})).toBe(false);
    expect(wantsPagination({ page: 1 })).toBe(true);
    expect(wantsPagination({ limit: 20 })).toBe(true);
  });
});

describe('ContactService.mergeContacts', () => {
  let service: ContactService;

  const contactRepository = {
    findById: jest.fn(),
    updateWithTenant: jest.fn(),
    delete: jest.fn(),
  };

  const dealService = {
    reassignContact: jest.fn(),
  };

  const activityRepository = {
    update: jest.fn(),
  };

  const noteRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: ContactRepository, useValue: contactRepository },
        { provide: DealService, useValue: dealService },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: getRepositoryToken(Activity), useValue: activityRepository },
        { provide: getRepositoryToken(Note), useValue: noteRepository },
        { provide: getRepositoryToken(EmailMessage), useValue: {} },
        { provide: getRepositoryToken(VoiceCall), useValue: {} },
        { provide: getRepositoryToken(WhatsAppMessage), useValue: {} },
      ],
    }).compile();

    service = module.get(ContactService);
    jest.clearAllMocks();
  });

  it('rejects merging a contact into itself', async () => {
    await expect(service.mergeContacts('t1', 'c1', 'c1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('merges tags/fields and reassigns related records', async () => {
    const primary = {
      id: 'c1',
      tenantId: 't1',
      tags: ['a'],
      customFields: { keep: 1 },
      phone: null,
      jobTitle: null,
      status: ContactStatus.LEAD,
    } as unknown as Contact;
    const secondary = {
      id: 'c2',
      tenantId: 't1',
      tags: ['b'],
      customFields: { extra: 2 },
      phone: '+1',
      jobTitle: 'VP',
      status: ContactStatus.PROSPECT,
    } as unknown as Contact;

    contactRepository.findById
      .mockResolvedValueOnce(primary)
      .mockResolvedValueOnce(secondary)
      .mockResolvedValueOnce({ ...primary, phone: '+1', jobTitle: 'VP', tags: ['a', 'b'] });
    contactRepository.updateWithTenant.mockResolvedValue(primary);
    contactRepository.delete.mockResolvedValue(undefined);
    activityRepository.update.mockResolvedValue(undefined);
    noteRepository.update.mockResolvedValue(undefined);
    dealService.reassignContact.mockResolvedValue(undefined);

    const result = await service.mergeContacts('t1', 'c1', 'c2');

    expect(contactRepository.updateWithTenant).toHaveBeenCalledWith(
      't1',
      'c1',
      expect.objectContaining({
        phone: '+1',
        jobTitle: 'VP',
        tags: ['a', 'b'],
      }),
    );
    expect(dealService.reassignContact).toHaveBeenCalledWith('t1', 'c2', 'c1');
    expect(contactRepository.delete).toHaveBeenCalledWith('t1', 'c2');
    expect(result.id).toBe('c1');
  });

  it('throws when secondary contact is missing', async () => {
    contactRepository.findById
      .mockResolvedValueOnce({ id: 'c1' } as Contact)
      .mockResolvedValueOnce(null);

    await expect(service.mergeContacts('t1', 'c1', 'c2')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('CompanyService.mergeCompanies', () => {
  let service: CompanyService;

  const repository = {
    findById: jest.fn(),
    updateWithTenant: jest.fn(),
    hardDelete: jest.fn(),
  };

  const contactRepository = { update: jest.fn() };
  const dealRepository = { update: jest.fn() };
  const activityRepository = { update: jest.fn() };
  const noteRepository = { update: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: CompanyRepository, useValue: repository },
        { provide: getRepositoryToken(Contact), useValue: contactRepository },
        { provide: getRepositoryToken(Deal), useValue: dealRepository },
        { provide: getRepositoryToken(Activity), useValue: activityRepository },
        { provide: getRepositoryToken(Note), useValue: noteRepository },
      ],
    }).compile();

    service = module.get(CompanyService);
    jest.clearAllMocks();
  });

  it('merges companies and reassigns children', async () => {
    const primary = {
      id: 'co1',
      tenantId: 't1',
      name: 'Primary',
      website: null,
      domain: null,
      industry: null,
      phone: null,
      address: null,
      city: null,
      country: null,
      logoUrl: null,
      sizeRange: null,
      annualRevenueRange: null,
      tags: ['x'],
    } as unknown as Company;
    const secondary = {
      id: 'co2',
      tenantId: 't1',
      name: 'Secondary',
      website: 'https://ex.com',
      domain: 'ex.com',
      industry: 'Tech',
      phone: '1',
      address: 'A',
      city: 'B',
      country: 'C',
      logoUrl: 'L',
      sizeRange: '1-10',
      annualRevenueRange: '1M',
      tags: ['y'],
    } as unknown as Company;

    repository.findById
      .mockResolvedValueOnce(primary)
      .mockResolvedValueOnce(secondary)
      .mockResolvedValueOnce({ ...primary, website: 'https://ex.com' });
    repository.updateWithTenant.mockResolvedValue(primary);
    repository.hardDelete.mockResolvedValue(undefined);

    const result = await service.mergeCompanies('t1', 'co1', 'co2');

    expect(contactRepository.update).toHaveBeenCalled();
    expect(dealRepository.update).toHaveBeenCalled();
    expect(activityRepository.update).toHaveBeenCalled();
    expect(noteRepository.update).toHaveBeenCalled();
    expect(repository.hardDelete).toHaveBeenCalledWith('t1', 'co2');
    expect(result.id).toBe('co1');
  });
});
