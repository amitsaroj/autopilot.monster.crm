import { Test, TestingModule } from '@nestjs/testing';

import { WorkflowActionExecutorService } from './workflow-action-executor.service';
import { ContactService } from '../crm/contact.service';
import { DealService } from '../crm/deal.service';
import { TaskCrmService, NoteService, EmailCrmService } from '../crm/crm-support.service';
import { EmailService } from '../../shared/email/email.service';
import { NotificationService } from '../notifications/notification.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { VoiceCallService } from '../voice/voice-call.service';
import { PipelineService } from '../crm/pipeline.service';
import { TaskPriority } from '../../database/entities/task.entity';

describe('WorkflowActionExecutorService', () => {
  let service: WorkflowActionExecutorService;

  const mockContactService = {
    create: jest.fn(),
    update: jest.fn(),
  };
  const mockDealService = {
    update: jest.fn(),
  };
  const mockTaskService = {
    create: jest.fn(),
  };
  const mockNoteService = {
    create: jest.fn(),
  };
  const mockEmailService = {
    sendEmail: jest.fn(),
  };
  const mockEmailCrmService = {
    sendEmail: jest.fn(),
  };
  const mockNotificationService = {
    create: jest.fn(),
  };
  const mockWhatsappService = {
    sendTextMessage: jest.fn(),
  };
  const mockVoiceCallService = {
    buildStreamUrl: jest.fn(),
    initiateOutbound: jest.fn(),
  };
  const mockPipelineService = {
    findDefault: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowActionExecutorService,
        { provide: ContactService, useValue: mockContactService },
        { provide: DealService, useValue: mockDealService },
        { provide: TaskCrmService, useValue: mockTaskService },
        { provide: NoteService, useValue: mockNoteService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: EmailCrmService, useValue: mockEmailCrmService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: WhatsappService, useValue: mockWhatsappService },
        { provide: VoiceCallService, useValue: mockVoiceCallService },
        { provide: PipelineService, useValue: mockPipelineService },
      ],
    }).compile();

    service = module.get(WorkflowActionExecutorService);
    jest.clearAllMocks();
  });

  it('creates a CRM task with resolved config', async () => {
    mockTaskService.create.mockResolvedValue({ id: 'task-123' });

    const result = await service.executeAction(
      {
        id: 'step-task',
        type: 'CREATE_TASK',
        config: {
          title: 'Follow up with {{contact.firstName}}',
          dueInHours: 2,
          priority: TaskPriority.HIGH,
          contactId: '{{contact.id}}',
        },
      },
      {
        tenantId: 'tenant-1',
        eventName: 'CONTACT_CREATED',
        payload: { contact: { id: 'contact-1', firstName: 'Jane' } },
      },
    );

    expect(mockTaskService.create).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({
        title: 'Follow up with Jane',
        contactId: 'contact-1',
        priority: TaskPriority.HIGH,
      }),
    );
    expect(result.status).toBe('COMPLETED');
    expect(result.taskId).toBe('task-123');
  });

  it('creates an in-app notification for NOTIFY_TEAM', async () => {
    mockNotificationService.create.mockResolvedValue({ id: 'notification-1' });

    const result = await service.executeAction(
      {
        id: 'step-notify',
        type: 'NOTIFY_TEAM',
        config: {
          title: 'Deal won',
          message: 'Deal {{deal.name}} closed',
        },
      },
      {
        tenantId: 'tenant-1',
        eventName: 'DEAL_WON',
        payload: { deal: { name: 'Enterprise Plan' } },
      },
    );

    expect(mockNotificationService.create).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({
        type: 'IN_APP',
        title: 'Deal won',
        content: 'Deal Enterprise Plan closed',
      }),
    );
    expect(result.status).toBe('COMPLETED');
    expect(result.notificationId).toBe('notification-1');
  });

  it('schedules long delays instead of blocking the worker', async () => {
    const result = await service.executeAction(
      {
        id: 'step-delay',
        type: 'DELAY',
        config: { delayHours: 2 },
      },
      {
        tenantId: 'tenant-1',
        eventName: 'MANUAL',
        payload: {},
      },
    );

    expect(result.status).toBe('SCHEDULED');
    expect(result.delayMs).toBe(2 * 60 * 60 * 1000);
  });

  it('initiates outbound voice call for INITIATE_CALL', async () => {
    mockVoiceCallService.buildStreamUrl.mockReturnValue('wss://example.com/voice/stream');
    mockVoiceCallService.initiateOutbound.mockResolvedValue({ id: 'call-1' });

    const result = await service.executeAction(
      {
        id: 'step-call',
        type: 'INITIATE_CALL',
        config: { to: '+15551234567', agentId: 'agent-1' },
      },
      {
        tenantId: 'tenant-1',
        eventName: 'DEAL_WON',
        payload: {},
      },
    );

    expect(mockVoiceCallService.initiateOutbound).toHaveBeenCalled();
    expect(result.status).toBe('COMPLETED');
    expect(result.callId).toBe('call-1');
  });
});
