import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ContactService } from '../../src/modules/crm/contact.service';
import { ContactRepository } from '../../src/modules/crm/contact.repository';
import { DealService } from '../../src/modules/crm/deal.service';
import { Activity } from '../../src/database/entities/activity.entity';
import { Note } from '../../src/database/entities/note.entity';
import { EmailMessage } from '../../src/database/entities/email-message.entity';
import { VoiceCall } from '../../src/database/entities/voice-call.entity';
import { WhatsAppMessage } from '../../src/database/entities/whatsapp-message.entity';

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
