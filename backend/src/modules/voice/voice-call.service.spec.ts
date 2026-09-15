import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';

import { VoiceCallService } from './voice-call.service';
import { VoiceCallRepository } from './voice-call.repository';
import { TwilioService } from './twilio.service';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { VoiceProviderRegistry } from './providers/voice-provider.registry';
import { StorageService } from '../../storage/storage.service';

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

  const twilioProvider = {
    name: 'twilio',
    getFromNumber: jest.fn(),
    initiateOutboundCall: jest.fn(),
    hangUpCall: jest.fn(),
    transferCall: jest.fn(),
    validateWebhookSignature: jest.fn(),
    checkHealth: jest.fn(),
  };

  const providerRegistry = {
    getProvider: jest.fn().mockResolvedValue(twilioProvider),
    resolveProviderName: jest.fn().mockResolvedValue('twilio'),
    listProviderNames: jest.fn().mockReturnValue(['twilio']),
    checkHealth: jest.fn(),
    checkAllHealth: jest.fn(),
  };

  const voicePhoneNumberService = {
    findTenantIdByNumber: jest.fn(),
  };

  const storageService = {
    putObject: jest.fn(),
  };

  const redisStore = new Map<string, string>();
  const voiceQueue = {
    client: {
      set: jest.fn((key: string, value: string) => {
        redisStore.set(key, value);
        return Promise.resolve('OK');
      }),
      get: jest.fn((key: string) => Promise.resolve(redisStore.get(key) ?? null)),
      del: jest.fn((key: string) => {
        redisStore.delete(key);
        return Promise.resolve(1);
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoiceCallService,
        { provide: VoiceCallRepository, useValue: voiceCallRepository },
        { provide: VoiceProviderRegistry, useValue: providerRegistry },
        { provide: VoicePhoneNumberService, useValue: voicePhoneNumberService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:8000') },
        },
        { provide: getQueueToken(QUEUE_NAMES.VOICE), useValue: voiceQueue },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    service = module.get(VoiceCallService);
    redisStore.clear();
    jest.clearAllMocks();
  });

  it('builds a token-based websocket stream URL and stashes the real context server-side', async () => {
    const url = await service.buildStreamUrl('tenant-1', {
      agentId: 'agent-1',
      leadId: 'lead-1',
      voice: 'shimmer',
    });

    expect(url).toMatch(/^ws:\/\/localhost:8000\/voice\/stream\?token=[^&]+$/);
    // The URL itself must not leak tenantId/leadId — only an opaque token.
    expect(url).not.toContain('tenant-1');
    expect(url).not.toContain('lead-1');

    const token = new URL(url.replace('ws://', 'http://')).searchParams.get('token')!;
    const resolved = await service.resolveStreamToken(token);
    expect(resolved).toEqual({
      tenantId: 'tenant-1',
      agentId: 'agent-1',
      leadId: 'lead-1',
      voice: 'shimmer',
    });

    // Single-use: resolving again must fail.
    expect(await service.resolveStreamToken(token)).toBeNull();
  });

  it('rejects an unknown/expired stream token', async () => {
    expect(await service.resolveStreamToken('does-not-exist')).toBeNull();
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
      provider: 'twilio',
      transferredToHuman: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    twilioProvider.getFromNumber.mockResolvedValue('+15550001');
    twilioProvider.initiateOutboundCall.mockResolvedValue('CA123');
    voiceCallRepository.findBySid.mockResolvedValue(null);
    voiceCallRepository.create.mockResolvedValue(persisted);

    const result = await service.initiateOutbound('tenant-1', {
      to: '+15550002',
      wssUrl: 'ws://localhost/voice/stream?tenantId=tenant-1',
      voiceProfile: 'shimmer',
    });

    expect(providerRegistry.getProvider).toHaveBeenCalledWith('tenant-1');
    expect(twilioProvider.initiateOutboundCall).toHaveBeenCalledWith(
      'tenant-1',
      '+15550002',
      'ws://localhost/voice/stream?tenantId=tenant-1',
      expect.objectContaining({
        statusCallbackUrl: 'http://localhost:8000/api/v1/voice/twilio/status-callback',
      }),
    );
    expect(voiceCallRepository.create).toHaveBeenCalledWith('tenant-1', {
      sid: 'CA123',
      to: '+15550002',
      from: '+15550001',
      direction: 'OUTBOUND',
      status: 'QUEUED',
      voiceProfile: 'shimmer',
      provider: 'twilio',
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
      provider: 'twilio',
      transferredToHuman: false,
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
