import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { VoiceCallService } from './voice-call.service';
import { VoiceCallRepository } from './voice-call.repository';
import { TwilioService } from './twilio.service';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';

describe('VoiceCallService', () => {
  let service: VoiceCallService;

  const voiceCallRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySid: jest.fn(),
    findBySidGlobal: jest.fn(),
    findWithTranscripts: jest.fn(),
    findByRecordingUrl: jest.fn(),
    create: jest.fn(),
    updateWithTenant: jest.fn(),
  };

  const twilioService = {
    getFromNumber: jest.fn(),
    initiateOutboundCall: jest.fn(),
    hangUpCall: jest.fn(),
    transferCall: jest.fn(),
  };

  const voicePhoneNumberService = {
    findTenantIdByNumber: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoiceCallService,
        { provide: VoiceCallRepository, useValue: voiceCallRepository },
        { provide: TwilioService, useValue: twilioService },
        { provide: VoicePhoneNumberService, useValue: voicePhoneNumberService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:8000') },
        },
      ],
    }).compile();

    service = module.get(VoiceCallService);
    jest.clearAllMocks();
  });

  it('builds websocket stream URL with tenant and agent context', () => {
    const url = service.buildStreamUrl('tenant-1', {
      agentId: 'agent-1',
      leadId: 'lead-1',
      voice: 'shimmer',
    });

    expect(url).toContain('ws://localhost:8000/voice/stream?');
    expect(url).toContain('tenantId=tenant-1');
    expect(url).toContain('agentId=agent-1');
    expect(url).toContain('leadId=lead-1');
    expect(url).toContain('voice=shimmer');
  });

  it('initiates outbound call and returns persisted record', async () => {
    const persisted: VoiceCall = {
      id: 'call-1',
      tenantId: 'tenant-1',
      sid: 'CA123',
      from: '+15550001',
      to: '+15550002',
      direction: 'OUTBOUND',
      status: 'QUEUED',
      durationSeconds: 0,
      costAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    twilioService.getFromNumber.mockResolvedValue('+15550001');
    twilioService.initiateOutboundCall.mockResolvedValue('CA123');
    voiceCallRepository.findBySid.mockResolvedValue(null);
    voiceCallRepository.create.mockResolvedValue(persisted);

    const result = await service.initiateOutbound('tenant-1', {
      to: '+15550002',
      wssUrl: 'ws://localhost/voice/stream?tenantId=tenant-1',
      voiceProfile: 'shimmer',
    });

    expect(twilioService.initiateOutboundCall).toHaveBeenCalledWith(
      'tenant-1',
      '+15550002',
      'ws://localhost/voice/stream?tenantId=tenant-1',
    );
    expect(voiceCallRepository.create).toHaveBeenCalledWith('tenant-1', {
      sid: 'CA123',
      to: '+15550002',
      from: '+15550001',
      direction: 'OUTBOUND',
      status: 'QUEUED',
      voiceProfile: 'shimmer',
    });
    expect(result).toEqual(persisted);
  });

  it('throws when call is missing', async () => {
    voiceCallRepository.findById.mockResolvedValue(null);
    voiceCallRepository.findBySid.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates call status from Twilio webhook', async () => {
    const existing: VoiceCall = {
      id: 'call-1',
      tenantId: 'tenant-1',
      sid: 'CA123',
      from: '+15550001',
      to: '+15550002',
      direction: 'INBOUND',
      status: 'RINGING',
      durationSeconds: 0,
      costAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = { ...existing, status: 'COMPLETED', durationSeconds: 42 };

    voiceCallRepository.findBySidGlobal.mockResolvedValue(existing);
    voiceCallRepository.updateWithTenant.mockResolvedValue(updated);

    const result = await service.updateFromWebhook({
      sid: 'CA123',
      status: 'COMPLETED',
      durationSeconds: 42,
    });

    expect(voiceCallRepository.updateWithTenant).toHaveBeenCalledWith('tenant-1', 'call-1', {
      status: 'COMPLETED',
      durationSeconds: 42,
      recordingUrl: undefined,
    });
    expect(result).toEqual(updated);
  });
});

describe('TwilioService routing TwiML', () => {
  it('uses the provided routing fallback URL', () => {
    const twilioServiceInstance = new TwilioService(
      { get: jest.fn() } as unknown as ConfigService,
      { get: jest.fn() } as unknown as ConfigOrchestratorService,
    );

    const twiml = twilioServiceInstance.generateRoutingTwiml(
      '+15551234567',
      'wss://example.com/voice/stream?tenantId=t1',
      'https://example.com/api/v1/voice/twilio/routing-fallback',
    );

    expect(twiml).toContain('action="https://example.com/api/v1/voice/twilio/routing-fallback"');
    expect(twiml).toContain('<Number>+15551234567</Number>');
  });
});
