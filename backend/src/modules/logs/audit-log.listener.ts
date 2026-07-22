import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '../../events/event.constants';
import { AuditLogService } from './audit-log.service';

interface DomainEventPayload {
  name?: string;
  tenantId?: string;
  actorId?: string;
  payload?: Record<string, unknown>;
  occurredAt?: string;
  correlationId?: string;
}

@Injectable()
export class AuditLogListener {
  private readonly logger = new Logger(AuditLogListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  private async write(
    action: string,
    resource: string,
    event: DomainEventPayload,
    resourceId?: string,
  ): Promise<void> {
    if (!event.tenantId) {
      return;
    }

    try {
      await this.auditLogService.log({
        tenantId: event.tenantId,
        userId: event.actorId,
        action,
        resource,
        resourceId,
        changes: event.payload ?? {},
      });
    } catch (error) {
      this.logger.error(
        `Failed to persist audit log for ${action}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  @OnEvent(EVENT_NAMES.USER_LOGIN)
  async onUserLogin(event: DomainEventPayload): Promise<void> {
    await this.write(
      'user.login',
      'user',
      event,
      String(event.payload?.['userId'] ?? event.actorId ?? ''),
    );
  }

  @OnEvent(EVENT_NAMES.USER_LOGOUT)
  async onUserLogout(event: DomainEventPayload): Promise<void> {
    await this.write('user.logout', 'user', event, event.actorId);
  }

  @OnEvent(EVENT_NAMES.USER_REGISTERED)
  async onUserRegistered(event: DomainEventPayload): Promise<void> {
    await this.write(
      'user.registered',
      'user',
      event,
      String(event.payload?.['userId'] ?? event.actorId ?? ''),
    );
  }

  @OnEvent(EVENT_NAMES.PASSWORD_RESET)
  async onPasswordReset(event: DomainEventPayload): Promise<void> {
    await this.write('user.password.reset', 'user', event, event.actorId);
  }

  @OnEvent(EVENT_NAMES.USER_VERIFIED)
  async onUserVerified(event: DomainEventPayload): Promise<void> {
    await this.write('user.verified', 'user', event, event.actorId);
  }

  @OnEvent(EVENT_NAMES.USER_MFA_ENABLED)
  async onMfaEnabled(event: DomainEventPayload): Promise<void> {
    await this.write('user.mfa.enabled', 'user', event, event.actorId);
  }

  @OnEvent(EVENT_NAMES.USER_MFA_DISABLED)
  async onMfaDisabled(event: DomainEventPayload): Promise<void> {
    await this.write('user.mfa.disabled', 'user', event, event.actorId);
  }

  @OnEvent(EVENT_NAMES.USER_INVITED)
  async onUserInvited(event: DomainEventPayload): Promise<void> {
    await this.write('user.invited', 'user', event, String(event.payload?.['invitationId'] ?? ''));
  }

  @OnEvent(EVENT_NAMES.USER_UPDATED)
  async onUserUpdated(event: DomainEventPayload): Promise<void> {
    await this.write('user.updated', 'user', event, String(event.payload?.['userId'] ?? ''));
  }

  @OnEvent(EVENT_NAMES.TENANT_CREATED)
  async onTenantCreated(event: DomainEventPayload): Promise<void> {
    await this.write('tenant.created', 'tenant', event, event.tenantId);
  }

  @OnEvent(EVENT_NAMES.TENANT_UPDATED)
  async onTenantUpdated(event: DomainEventPayload): Promise<void> {
    await this.write('tenant.updated', 'tenant', event, event.tenantId);
  }

  @OnEvent(EVENT_NAMES.TENANT_SUSPENDED)
  async onTenantSuspended(event: DomainEventPayload): Promise<void> {
    await this.write('tenant.suspended', 'tenant', event, event.tenantId);
  }

  @OnEvent(EVENT_NAMES.ROLE_CREATED)
  async onRoleCreated(event: DomainEventPayload): Promise<void> {
    await this.write('role.created', 'role', event, String(event.payload?.['roleId'] ?? ''));
  }

  @OnEvent(EVENT_NAMES.ROLE_UPDATED)
  async onRoleUpdated(event: DomainEventPayload): Promise<void> {
    await this.write('role.updated', 'role', event, String(event.payload?.['roleId'] ?? ''));
  }

  @OnEvent(EVENT_NAMES.ROLE_ASSIGNED)
  async onRoleAssigned(event: DomainEventPayload): Promise<void> {
    await this.write('role.assigned', 'role', event, String(event.payload?.['roleId'] ?? ''));
  }

  @OnEvent(EVENT_NAMES.ROLE_REVOKED)
  async onRoleRevoked(event: DomainEventPayload): Promise<void> {
    await this.write('role.revoked', 'role', event, String(event.payload?.['roleId'] ?? ''));
  }

  private crmEvent(
    event: DomainEventPayload & { changedBy?: string },
    entity: { id?: string } | undefined,
    entityKey: string,
    extraPayload?: Record<string, unknown>,
  ): DomainEventPayload & { resourceId?: string } {
    const resourceId = entity?.id ? String(entity.id) : undefined;
    const payload: Record<string, unknown> = {
      ...(event.payload ?? {}),
      ...(extraPayload ?? {}),
    };
    if (resourceId) {
      payload[`${entityKey}Id`] = resourceId;
    }

    return {
      tenantId: event.tenantId,
      actorId: event.actorId ?? event.changedBy,
      payload,
      resourceId,
    };
  }

  @OnEvent(EVENT_NAMES.CONTACT_CREATED)
  async onContactCreated(event: DomainEventPayload & { contact?: { id: string } }): Promise<void> {
    const ctx = this.crmEvent(event, event.contact, 'contact');
    await this.write('contact.created', 'contact', ctx, ctx.resourceId);
  }

  @OnEvent(EVENT_NAMES.CONTACT_UPDATED)
  async onContactUpdated(event: DomainEventPayload & { contact?: { id: string } }): Promise<void> {
    const ctx = this.crmEvent(event, event.contact, 'contact');
    await this.write('contact.updated', 'contact', ctx, ctx.resourceId);
  }

  @OnEvent(EVENT_NAMES.CONTACT_DELETED)
  async onContactDeleted(
    event: DomainEventPayload & { contact?: { id: string }; contactId?: string },
  ): Promise<void> {
    const resourceId = String(
      event.contact?.id ?? event.contactId ?? event.payload?.['contactId'] ?? '',
    );
    await this.write(
      'contact.deleted',
      'contact',
      {
        tenantId: event.tenantId,
        actorId: event.actorId,
        payload: { contactId: resourceId, ...(event.payload ?? {}) },
      },
      resourceId,
    );
  }

  @OnEvent(EVENT_NAMES.CONTACT_MERGED)
  async onContactMerged(
    event: DomainEventPayload & {
      contact?: { id: string };
      primaryId?: string;
      secondaryId?: string;
    },
  ): Promise<void> {
    const resourceId = String(event.contact?.id ?? event.primaryId ?? '');
    await this.write(
      'contact.merged',
      'contact',
      {
        tenantId: event.tenantId,
        actorId: event.actorId,
        payload: {
          contactId: resourceId,
          primaryId: event.primaryId,
          secondaryId: event.secondaryId,
          ...(event.payload ?? {}),
        },
      },
      resourceId,
    );
  }

  @OnEvent(EVENT_NAMES.COMPANY_CREATED)
  async onCompanyCreated(event: DomainEventPayload & { company?: { id: string } }): Promise<void> {
    const ctx = this.crmEvent(event, event.company, 'company');
    await this.write('company.created', 'company', ctx, ctx.resourceId);
  }

  @OnEvent(EVENT_NAMES.COMPANY_UPDATED)
  async onCompanyUpdated(event: DomainEventPayload & { company?: { id: string } }): Promise<void> {
    const ctx = this.crmEvent(event, event.company, 'company');
    await this.write('company.updated', 'company', ctx, ctx.resourceId);
  }

  @OnEvent(EVENT_NAMES.COMPANY_DELETED)
  async onCompanyDeleted(
    event: DomainEventPayload & { company?: { id: string }; companyId?: string },
  ): Promise<void> {
    const resourceId = String(
      event.company?.id ?? event.companyId ?? event.payload?.['companyId'] ?? '',
    );
    await this.write(
      'company.deleted',
      'company',
      {
        tenantId: event.tenantId,
        actorId: event.actorId,
        payload: { companyId: resourceId, ...(event.payload ?? {}) },
      },
      resourceId,
    );
  }

  @OnEvent(EVENT_NAMES.COMPANY_MERGED)
  async onCompanyMerged(
    event: DomainEventPayload & {
      company?: { id: string };
      primaryId?: string;
      secondaryId?: string;
    },
  ): Promise<void> {
    const resourceId = String(event.company?.id ?? event.primaryId ?? '');
    await this.write(
      'company.merged',
      'company',
      {
        tenantId: event.tenantId,
        actorId: event.actorId,
        payload: {
          companyId: resourceId,
          primaryId: event.primaryId,
          secondaryId: event.secondaryId,
          ...(event.payload ?? {}),
        },
      },
      resourceId,
    );
  }

  @OnEvent(EVENT_NAMES.DEAL_CREATED)
  async onDealCreated(event: DomainEventPayload & { deal?: { id: string } }): Promise<void> {
    const ctx = this.crmEvent(event, event.deal, 'deal');
    await this.write('deal.created', 'deal', ctx, ctx.resourceId);
  }

  @OnEvent(EVENT_NAMES.DEAL_UPDATED)
  async onDealUpdated(event: DomainEventPayload & { deal?: { id: string } }): Promise<void> {
    const ctx = this.crmEvent(event, event.deal, 'deal');
    await this.write('deal.updated', 'deal', ctx, ctx.resourceId);
  }

  @OnEvent(EVENT_NAMES.DEAL_DELETED)
  async onDealDeleted(
    event: DomainEventPayload & { deal?: { id: string }; dealId?: string },
  ): Promise<void> {
    const resourceId = String(event.deal?.id ?? event.dealId ?? event.payload?.['dealId'] ?? '');
    await this.write(
      'deal.deleted',
      'deal',
      {
        tenantId: event.tenantId,
        actorId: event.actorId,
        payload: { dealId: resourceId, ...(event.payload ?? {}) },
      },
      resourceId,
    );
  }

  @OnEvent(EVENT_NAMES.DEAL_STAGE_CHANGED)
  async onDealStageChanged(
    event: DomainEventPayload & {
      deal?: { id: string };
      oldStageId?: string;
      newStageId?: string;
      reason?: string;
      changedBy?: string;
    },
  ): Promise<void> {
    const ctx = this.crmEvent(event, event.deal, 'deal', {
      oldStageId: event.oldStageId,
      newStageId: event.newStageId,
      reason: event.reason,
    });
    await this.write('deal.stage.changed', 'deal', ctx, ctx.resourceId);
  }

  @OnEvent(EVENT_NAMES.LEAD_CREATED)
  async onLeadCreated(event: DomainEventPayload & { lead?: { id: string } }): Promise<void> {
    const ctx = this.crmEvent(event, event.lead, 'lead');
    await this.write('lead.created', 'lead', ctx, ctx.resourceId);
  }

  @OnEvent(EVENT_NAMES.LEAD_UPDATED)
  async onLeadUpdated(event: DomainEventPayload & { lead?: { id: string } }): Promise<void> {
    const ctx = this.crmEvent(event, event.lead, 'lead');
    await this.write('lead.updated', 'lead', ctx, ctx.resourceId);
  }

  @OnEvent(EVENT_NAMES.LEAD_DELETED)
  async onLeadDeleted(
    event: DomainEventPayload & { lead?: { id: string }; leadId?: string },
  ): Promise<void> {
    const resourceId = String(event.lead?.id ?? event.leadId ?? event.payload?.['leadId'] ?? '');
    await this.write(
      'lead.deleted',
      'lead',
      {
        tenantId: event.tenantId,
        actorId: event.actorId,
        payload: { leadId: resourceId, ...(event.payload ?? {}) },
      },
      resourceId,
    );
  }
}
