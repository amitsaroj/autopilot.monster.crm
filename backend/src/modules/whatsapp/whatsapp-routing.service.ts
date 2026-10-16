import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { Contact } from '../../database/entities/contact.entity';
import { UserEntity, UserStatus } from '../auth/entities/user.entity';

const routingAction = 'whatsapp.conversation.round_robin_assigned';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface WhatsappRoutingAssignment {
  assigneeId: string;
  contactId: string;
  phone: string;
}

@Injectable()
export class WhatsappRoutingService {
  constructor(private readonly dataSource: DataSource) {}

  async assignConversation(
    tenantId: string,
    contactId: string,
    userIds?: string[],
  ): Promise<WhatsappRoutingAssignment> {
    return this.dataSource.transaction('READ COMMITTED', (manager) =>
      this.assignConversationWithManager(manager, tenantId, contactId, userIds),
    );
  }

  /** The caller must keep this manager's READ COMMITTED transaction open through commit. */
  async assignConversationWithManager(
    manager: EntityManager,
    tenantId: string,
    contactId: string,
    userIds?: string[],
  ): Promise<WhatsappRoutingAssignment> {
    if (
      typeof tenantId !== 'string' ||
      typeof contactId !== 'string' ||
      !uuid.test(tenantId) ||
      !uuid.test(contactId)
    ) {
      throw new BadRequestException('Tenant and conversation contact IDs must be valid UUIDs');
    }
    tenantId = tenantId.toLowerCase();
    contactId = contactId.toLowerCase();
    if (
      userIds !== undefined &&
      (!Array.isArray(userIds) ||
        userIds.length > 50 ||
        userIds.some((id) => typeof id !== 'string' || !uuid.test(id)))
    ) {
      throw new BadRequestException('Eligible userIds must be an array of at most 50 valid UUIDs');
    }
    if (!manager.queryRunner?.isTransactionActive) {
      throw new ConflictException('Round-robin assignment requires an active transaction');
    }
    const isolation: unknown = await manager.query('SHOW transaction_isolation');
    if (!Array.isArray(isolation) || isolation[0]?.transaction_isolation !== 'read committed') {
      throw new ConflictException('Round-robin assignment requires READ COMMITTED isolation');
    }
    await manager.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [
      'whatsapp-round-robin',
      tenantId.toLowerCase(),
    ]);

    const contacts = manager.getRepository(Contact);
    const contact = await contacts.findOne({
      where: { id: contactId, tenantId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!contact) throw new NotFoundException('Conversation contact was not found in this tenant');
    const phone = contact.mobile?.trim() || contact.phone?.trim();
    if (!phone)
      throw new BadRequestException('Conversation contact needs a phone or mobile number');

    const users = manager.getRepository(UserEntity);
    const explicitIds = userIds?.map((id) => id.toLowerCase());
    if (explicitIds?.length) {
      const members = await users.find({
        where: { tenantId, id: In([...new Set(explicitIds)]) },
        select: { id: true },
      });
      if (members.length !== new Set(explicitIds).size) {
        throw new BadRequestException('Every eligible user ID must belong to this tenant');
      }
    }
    const query = users
      .createQueryBuilder('member')
      .select(['member.id'])
      .where('member.tenantId = :tenantId', { tenantId })
      .andWhere('member.status = :status', { status: UserStatus.ACTIVE })
      .andWhere(
        `NOT EXISTS (
        SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = member.id AND r.deleted_at IS NULL AND (
          UPPER(REPLACE(REPLACE(r.name, '_', ''), '-', '')) IN ('SUPERADMIN', 'PLATFORMADMIN')
          OR EXISTS (SELECT 1 FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id
            WHERE rp.role_id = r.id AND p.resource = 'admin')
        )
      )`,
      )
      .orderBy('member.id', 'ASC')
      .setLock('pessimistic_write');
    if (explicitIds !== undefined) {
      if (!explicitIds.length)
        throw new BadRequestException('Choose at least one eligible teammate');
      query.andWhere('member.id IN (:...userIds)', { userIds: explicitIds });
    } else {
      query.andWhere(`EXISTS (
        SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
          JOIN role_permissions rp ON rp.role_id = r.id JOIN permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = member.id AND ur.tenant_id = :tenantId
          AND r.tenant_id = :tenantId AND r.deleted_at IS NULL
          AND p.resource = 'whatsapp'
        GROUP BY ur.user_id
        HAVING BOOL_OR(p.action IN ('read', 'view')) AND BOOL_OR(p.action IN ('create', 'update', 'write'))
      )`);
    }
    const eligible = await query.getMany();
    if (!eligible.length) {
      throw new BadRequestException(
        'No active eligible teammates are available. Add active tenant members with WhatsApp read and reply permissions or choose an explicit team; platform administrators are excluded.',
      );
    }

    const audits = manager.getRepository(AuditLog);
    const previous = await audits.findOne({
      where: { tenantId, action: routingAction, resource: 'contact' },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    const changes: unknown = previous?.changes;
    const newValues: unknown =
      changes && typeof changes === 'object'
        ? (changes as Record<string, unknown>).newValues
        : undefined;
    const lastAssignee: unknown =
      newValues && typeof newValues === 'object'
        ? (newValues as Record<string, unknown>).assigneeId
        : undefined;
    const assigneeId =
      eligible.find((member) => typeof lastAssignee === 'string' && member.id > lastAssignee)?.id ??
      eligible[0].id;
    const customFields: Record<string, unknown> = contact.customFields ?? {};
    const auditChanges = {
      oldValues: {
        assigneeId: contact.ownerId ?? null,
        whatsappStatus: customFields.whatsappStatus ?? null,
      },
      newValues: { assigneeId, whatsappStatus: 'OPEN' },
    };
    contact.ownerId = assigneeId;
    contact.customFields = { ...customFields, whatsappStatus: 'OPEN' };
    await contacts.save(contact);
    await audits
      .createQueryBuilder()
      .insert()
      .values({
        tenantId,
        action: routingAction,
        resource: 'contact',
        resourceId: contact.id,
        changes: () => 'CAST(:routingChanges AS jsonb)',
        // Transaction timestamps can tie; strictly increasing audit times preserve the durable cursor.
        createdAt:
          () => `GREATEST(clock_timestamp(), COALESCE((SELECT MAX(created_at) + INTERVAL '1 microsecond'
        FROM audit_logs WHERE tenant_id = :routingTenantId AND action = :routingAction AND resource = 'contact'), clock_timestamp()))`,
      })
      .setParameters({
        routingTenantId: tenantId,
        routingAction,
        routingChanges: JSON.stringify(auditChanges),
      })
      .execute();
    return { assigneeId, contactId: contact.id, phone };
  }
}
