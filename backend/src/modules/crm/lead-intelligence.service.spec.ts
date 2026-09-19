import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { LeadIntelligenceService } from './lead-intelligence.service';
import { LeadService } from './lead.service';
import { ContactService } from './contact.service';
import { NotificationService } from './notification.service';
import { AiProviderService } from '../ai/providers/ai-provider.service';
import { EVENT_NAMES } from '../../events/event.constants';

describe('LeadIntelligenceService', () => {
  let service: LeadIntelligenceService;
  let leadService: { update: jest.Mock; findOne: jest.Mock };
  let contactService: {
    findOne: jest.Mock;
    recordCallActivity: jest.Mock;
    setDoNotContact: jest.Mock;
  };
  let notificationService: { sendPostCallFollowUp: jest.Mock };
  let aiProviderService: { chatComplete: jest.Mock };
  let eventEmitter: { emit: jest.Mock };

  const analysisJson = JSON.stringify({
    name: 'Jordan',
    email: 'jordan@example.com',
    summary: 'Interested in the enterprise plan.',
    score: 90,
    status: 'QUALIFIED',
    intent: 'PRICING',
    sentiment: 'POSITIVE',
    disposition: 'QUALIFIED',
    doNotCall: false,
  });

  beforeEach(async () => {
    leadService = {
      update: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue({ id: 'lead-1', phone: '+15551230000', firstName: 'Jordan' }),
    };
    contactService = {
      findOne: jest.fn(),
      recordCallActivity: jest.fn().mockResolvedValue(undefined),
      setDoNotContact: jest.fn().mockResolvedValue(undefined),
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
    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadIntelligenceService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('real-key') } },
        { provide: LeadService, useValue: leadService },
        { provide: ContactService, useValue: contactService },
        { provide: NotificationService, useValue: notificationService },
        { provide: AiProviderService, useValue: aiProviderService },
        { provide: EventEmitter2, useValue: eventEmitter },
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
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EVENT_NAMES.CALL_DISPOSITIONED,
        expect.objectContaining({ tenantId: 'tenant-1', leadId: 'lead-1', disposition: 'QUALIFIED' }),
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
        sentiment: 'QUALIFIED',
        status: 'QUALIFIED',
      });
      expect(notificationService.sendPostCallFollowUp).not.toHaveBeenCalled();
      expect(contactService.setDoNotContact).not.toHaveBeenCalled();
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

    it('emits a CALL_DISPOSITIONED event carrying the campaign/recipient context', async () => {
      contactService.findOne.mockResolvedValue({
        id: 'contact-3',
        firstName: 'Jordan',
        phone: '+15559998888',
        mobile: null,
        whatsappOptIn: false,
      });

      await service.analyzeContactCallOutcome('tenant-1', 'contact-3', 'transcript text', {
        campaignId: 'campaign-1',
        recipientId: 'recipient-1',
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EVENT_NAMES.CALL_DISPOSITIONED,
        expect.objectContaining({
          tenantId: 'tenant-1',
          contactId: 'contact-3',
          campaignId: 'campaign-1',
          recipientId: 'recipient-1',
          disposition: 'QUALIFIED',
        }),
      );
    });

    it('marks the contact do-not-contact when the AI detects an opt-out request', async () => {
      contactService.findOne.mockResolvedValue({
        id: 'contact-4',
        firstName: 'Jordan',
        phone: '+15559998888',
        mobile: null,
        whatsappOptIn: false,
        doNotContact: false,
      });
      aiProviderService.chatComplete.mockResolvedValueOnce({
        content: JSON.stringify({
          name: 'Jordan',
          summary: 'Asked to be removed from the calling list.',
          score: 0,
          status: 'UNQUALIFIED',
          intent: 'OPT_OUT',
          sentiment: 'NEGATIVE',
          disposition: 'DO_NOT_CALL',
          doNotCall: true,
        }),
        usage: { inputTokens: 0, outputTokens: 0 },
        model: 'gpt-4o-mini',
      });

      await service.analyzeContactCallOutcome('tenant-1', 'contact-4', 'transcript text');

      expect(contactService.setDoNotContact).toHaveBeenCalledWith('tenant-1', 'contact-4', true);
    });
  });
});
