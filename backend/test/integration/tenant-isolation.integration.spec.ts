import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ContactService } from '../../src/modules/crm/contact.service';
import { ContactRepository } from '../../src/modules/crm/contact.repository';
import { DealService } from '../../src/modules/crm/deal.service';
import { DealRepository } from '../../src/modules/crm/deal.repository';
import { PipelineService } from '../../src/modules/crm/pipeline.service';
import { WalletService } from '../../src/modules/billing/wallet.service';
import { Activity } from '../../src/database/entities/activity.entity';
import { Note } from '../../src/database/entities/note.entity';
import { EmailMessage } from '../../src/database/entities/email-message.entity';
import { VoiceCall } from '../../src/database/entities/voice-call.entity';
import { WhatsAppMessage } from '../../src/database/entities/whatsapp-message.entity';
import { Wallet } from '../../src/database/entities/wallet.entity';
import { WalletTransaction } from '../../src/database/entities/wallet-transaction.entity';
import { PipelineStage } from '../../src/database/entities/pipeline-stage.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

const TENANT_A = '11111111-1111-1111-1111-111111111111';
const TENANT_B = '22222222-2222-2222-2222-222222222222';

describe('Tenant isolation (ContactService)', () => {
  let service: ContactService;

  const mockContactRepository = {
    findById: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: ContactRepository, useValue: mockContactRepository },
        { provide: DealService, useValue: { findByContact: jest.fn() } },
        { provide: getRepositoryToken(Activity), useValue: {} },
        { provide: getRepositoryToken(Note), useValue: {} },
        { provide: getRepositoryToken(EmailMessage), useValue: {} },
        { provide: getRepositoryToken(VoiceCall), useValue: {} },
        { provide: getRepositoryToken(WhatsAppMessage), useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get(ContactService);
    jest.clearAllMocks();
  });

  it('returns contact only for matching tenant', async () => {
    mockContactRepository.findById.mockImplementation((tenantId: string, id: string) => {
      if (tenantId === TENANT_A && id === 'contact-1') {
        return Promise.resolve({ id, tenantId, firstName: 'Alice' });
      }
      return Promise.resolve(null);
    });

    await expect(service.findOne(TENANT_A, 'contact-1')).resolves.toMatchObject({
      tenantId: TENANT_A,
    });
    await expect(service.findOne(TENANT_B, 'contact-1')).rejects.toThrow('Contact not found');
  });
});

describe('Tenant isolation (DealService)', () => {
  let service: DealService;

  const mockDealRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealService,
        { provide: DealRepository, useValue: mockDealRepository },
        { provide: PipelineService, useValue: { findOne: jest.fn(), findDefault: jest.fn() } },
        { provide: getRepositoryToken(PipelineStage), useValue: { findOne: jest.fn() } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get(DealService);
    jest.clearAllMocks();
  });

  it('returns deal only for matching tenant', async () => {
    mockDealRepository.findOne.mockImplementation((tenantId: string, options: { where: { id: string } }) => {
      if (tenantId === TENANT_A && options.where.id === 'deal-1') {
        return Promise.resolve({ id: 'deal-1', tenantId: TENANT_A, name: 'Deal A' });
      }
      return Promise.resolve(null);
    });

    await expect(service.findOne(TENANT_A, 'deal-1')).resolves.toMatchObject({ tenantId: TENANT_A });
    await expect(service.findOne(TENANT_B, 'deal-1')).rejects.toThrow('Deal not found');
  });
});

describe('Tenant isolation (WalletService)', () => {
  let service: WalletService;

  const mockWalletRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTransactionRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useValue: mockWalletRepository },
        { provide: getRepositoryToken(WalletTransaction), useValue: mockTransactionRepository },
      ],
    }).compile();

    service = module.get(WalletService);
    jest.clearAllMocks();
  });

  it('loads wallet scoped to tenant id', async () => {
    mockWalletRepository.findOne.mockImplementation(({ where }: { where: { tenantId: string } }) => {
      if (where.tenantId === TENANT_A) {
        return Promise.resolve({ tenantId: TENANT_A, balance: 100, currency: 'USD' });
      }
      return Promise.resolve(null);
    });
    mockWalletRepository.create.mockImplementation((data: Partial<Wallet>) => data);
    mockWalletRepository.save.mockImplementation((wallet: Wallet) => Promise.resolve(wallet));

    await expect(service.getWallet(TENANT_A)).resolves.toMatchObject({ tenantId: TENANT_A, balance: 100 });

    mockWalletRepository.findOne.mockResolvedValue(null);
    mockWalletRepository.save.mockImplementation((wallet: Wallet) =>
      Promise.resolve({ ...wallet, balance: 0, currency: 'USD' }),
    );

    await expect(service.getWallet(TENANT_B)).resolves.toMatchObject({ tenantId: TENANT_B, balance: 0 });
    expect(mockWalletRepository.findOne).toHaveBeenCalledWith({ where: { tenantId: TENANT_B } });
  });
});
