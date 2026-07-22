import { Test, TestingModule } from '@nestjs/testing';

import { AuditLogListener } from './audit-log.listener';
import { AuditLogService } from './audit-log.service';

describe('AuditLogListener CRM events', () => {
  let listener: AuditLogListener;
  const log = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogListener,
        { provide: AuditLogService, useValue: { log } },
      ],
    }).compile();

    listener = module.get(AuditLogListener);
    jest.clearAllMocks();
  });

  it('writes contact.created audit log', async () => {
    await listener.onContactCreated({
      tenantId: 'tenant-1',
      actorId: 'user-1',
      contact: { id: 'contact-1' },
    });

    expect(log).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      userId: 'user-1',
      action: 'contact.created',
      resource: 'contact',
      resourceId: 'contact-1',
      changes: { contactId: 'contact-1' },
    });
  });

  it('writes deal.stage.changed audit log', async () => {
    await listener.onDealStageChanged({
      tenantId: 'tenant-1',
      actorId: 'user-2',
      deal: { id: 'deal-1' },
      oldStageId: 'stage-a',
      newStageId: 'stage-b',
      reason: 'qualified',
    });

    expect(log).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      userId: 'user-2',
      action: 'deal.stage.changed',
      resource: 'deal',
      resourceId: 'deal-1',
      changes: {
        dealId: 'deal-1',
        oldStageId: 'stage-a',
        newStageId: 'stage-b',
        reason: 'qualified',
      },
    });
  });

  it('writes contact.merged audit log', async () => {
    await listener.onContactMerged({
      tenantId: 'tenant-1',
      primaryId: 'contact-1',
      secondaryId: 'contact-2',
      contact: { id: 'contact-1' },
    });

    expect(log).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      userId: undefined,
      action: 'contact.merged',
      resource: 'contact',
      resourceId: 'contact-1',
      changes: {
        contactId: 'contact-1',
        primaryId: 'contact-1',
        secondaryId: 'contact-2',
      },
    });
  });

  it('skips audit when tenantId is missing', async () => {
    await listener.onLeadCreated({
      lead: { id: 'lead-1' },
    });

    expect(log).not.toHaveBeenCalled();
  });

  it('writes lead.deleted audit log', async () => {
    await listener.onLeadDeleted({
      tenantId: 'tenant-1',
      lead: { id: 'lead-9' },
    });

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'lead.deleted',
        resource: 'lead',
        resourceId: 'lead-9',
      }),
    );
  });
});
