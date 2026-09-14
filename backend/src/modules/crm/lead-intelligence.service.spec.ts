import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { LeadIntelligenceService } from './lead-intelligence.service';
import { LeadService } from './lead.service';
import { ContactService } from './contact.service';
import { NotificationService } from './notification.service';
import { AiProviderService } from '../ai/providers/ai-provider.service';

describe('LeadIntelligenceService', () => {
  let service: LeadIntelligenceService;
  let leadService: { update: jest.Mock; findOne: jest.Mock };
  let contactService: { findOne: jest.Mock; recordCallActivity: jest.Mock };
  let notificationService: { sendPostCallFollowUp: jest.Mock };
  let aiProviderService: { chatComplete: jest.Mock };

  const analysisJson = JSON.stringify({
    name: 'Jordan',
    email: 'jordan@example.com',
    summary: 'Interested in the enterprise plan.',
    score: 90,
    status: 'QUALIFIED',
    intent: 'PRICING',
    sentiment: 'POSITIVE',
  });

  beforeEach(async () => {
    leadService = {
      update: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue({ id: 'lead-1', phone: '+15551230000', firstName: 'Jordan' }),
    };
    contactService = {
      findOne: jest.fn(),
      recordCallActivity: jest.fn().mockResolvedValue(undefined),
    };
    notificationService = {
      sendPostCallFollowUp: jest.fn().mockResolvedValue(true),
    };
    aiProviderService = {
      chatComplete: jest.fn().mockResolvedValue({
        content: analysisJson,
        usage: { inputTokens: 0, outputTokens: 0 },
        model: 'gpt-4o-mini',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadIntelligenceService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('real-key') } },
        { provide: LeadService, useValue: leadService },
        { provide: ContactService, useValue: contactService },
        { provide: NotificationService, useValue: notificationService },
        { provide: AiProviderService, useValue: aiProviderService },
      ],
    }).compile();

    service = module.get(LeadIntelligenceService);
  });

  describe('analyzeCallOutcome (Lead)', () => {
    it('updates the lead and sends a follow-up when qualified', async () => {
      const result = await service.analyzeCallOutcome('tenant-1', 'lead-1', 'transcript text');

      expect(result?.status).toBe('QUALIFIED');
      expect(leadService.update).toHaveBeenCalledWith(
        'tenant-1',
        'lead-1',
        expect.objectContaining({ status: 'QUALIFIED' }),
      );
      expect(notificationService.sendPostCallFollowUp).toHaveBeenCalledWith(
        'tenant-1',
        '+15551230000',
        'Jordan',
        'Interested in the enterprise plan.',
      );
    });
  });

  describe('analyzeContactCallOutcome (Contact — bulk voice campaigns)', () => {
    it('logs a CALL activity but withholds follow-up when the contact has not opted in', async () => {
      contactService.findOne.mockResolvedValue({
        id: 'contact-1',
        firstName: 'Jordan',
        phone: '+15559998888',
        mobile: null,
        whatsappOptIn: false,
      });

      const result = await service.analyzeContactCallOutcome(
        'tenant-1',
        'contact-1',
        'transcript text',
      );

      expect(result?.status).toBe('QUALIFIED');
      expect(contactService.recordCallActivity).toHaveBeenCalledWith('tenant-1', 'contact-1', {
        summary: 'Interested in the enterprise plan.',
        sentiment: 'POSITIVE',
        status: 'QUALIFIED',
      });
      expect(notificationService.sendPostCallFollowUp).not.toHaveBeenCalled();
    });

    it('sends the WhatsApp follow-up when the contact has opted in', async () => {
      contactService.findOne.mockResolvedValue({
        id: 'contact-2',
        firstName: 'Jordan',
        phone: '+15559998888',
        mobile: null,
        whatsappOptIn: true,
      });

      await service.analyzeContactCallOutcome('tenant-1', 'contact-2', 'transcript text');

      expect(notificationService.sendPostCallFollowUp).toHaveBeenCalledWith(
        'tenant-1',
        '+15559998888',
        'Jordan',
        'Interested in the enterprise plan.',
      );
    });
  });
});
