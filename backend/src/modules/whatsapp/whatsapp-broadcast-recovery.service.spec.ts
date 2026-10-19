import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { WhatsAppBroadcast } from '../../database/entities/whatsapp-broadcast.entity';
import { WhatsappBroadcastJobPayload } from './whatsapp-broadcast.processor';
import { WhatsappBroadcastRecoveryService } from './whatsapp-broadcast-recovery.service';

describe('WhatsappBroadcastRecoveryService', () => {
  const tenantId = 'tenant-a';
  const phoneNumberId = 'phone-a';

  function setup(rows: unknown[] = []) {
    const manager = { query: jest.fn() };
    manager.query.mockResolvedValueOnce(rows);
    const transaction = jest.fn((run: (value: typeof manager) => Promise<void>) => run(manager));
    const repository = {
      manager: { transaction },
    } as unknown as Repository<WhatsAppBroadcast>;
    const queue = { add: jest.fn().mockResolvedValue(undefined) } as unknown as Queue<WhatsappBroadcastJobPayload>;
    return { service: new WhatsappBroadcastRecoveryService(repository, queue), manager, queue };
  }

  it('resumes only the tenant and sender matching a paused credential failure', async () => {
    const { service, manager, queue } = setup([
      {
        id: 'broadcast-a',
        recurrenceSeriesId: null,
        recurrenceFrequency: null,
        phoneNumberId,
        scheduledAt: new Date(Date.now() - 60_000),
      },
    ]);
    manager.query.mockResolvedValueOnce([{ controlVersion: 4 }]);

    await service.resumeAfterCredentialReconnect(tenantId, phoneNumberId);

    expect(manager.query.mock.calls[0][1]).toEqual([tenantId, phoneNumberId]);
    expect(manager.query.mock.calls[0][0]).toContain("status='PAUSED'");
    expect(manager.query.mock.calls[0][0]).toContain('last_error LIKE');
    expect(queue.add).toHaveBeenCalledWith(
      'broadcast-start',
      { tenantId, broadcastId: 'broadcast-a', phoneNumberId },
      expect.objectContaining({
        jobId: expect.stringMatching(/^broadcast-recovery-broadcast-a-4-/),
        delay: 0,
      }),
    );
  });

  it('does not enqueue when there are no credential-paused broadcasts', async () => {
    const { service, queue } = setup();

    await service.resumeAfterCredentialReconnect(tenantId, phoneNumberId);

    expect(queue.add).not.toHaveBeenCalled();
  });
});
