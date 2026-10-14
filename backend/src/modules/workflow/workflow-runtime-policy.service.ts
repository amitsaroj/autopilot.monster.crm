import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DataSource, EntityManager } from 'typeorm';
import { PricingService } from '../pricing/pricing.service';
import { Flow } from '../../database/entities/flow.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Company } from '../../database/entities/company.entity';
import { Pipeline } from '../../database/entities/pipeline.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';
import { Agent } from '../../database/entities/agent.entity';
import { KnowledgeBase } from '../../database/entities/knowledge-base.entity';
import { WhatsAppTemplate } from '../../database/entities/whatsapp-template.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { WorkflowStep } from './workflow-definition';

export const WORKFLOW_ENTITLEMENT_POLICY = 'WORKFLOW_ENTITLEMENT_POLICY';
export interface WorkflowEntitlementPolicy {
  assertFlowEntitlement(tenantId: string, flow: Flow, phase?: 'publish' | 'execute'): Promise<void>;
}

@Injectable()
export class WorkflowRuntimePolicyService {
  constructor(
    private readonly pricing: PricingService,
    private readonly dataSource: DataSource,
    private readonly moduleRef: ModuleRef,
  ) {}

  async assertFeature(tenantId: string, feature: string): Promise<void> {
    const tenant = await this.dataSource.getRepository(Tenant).findOneBy({ id: tenantId });
    if (!tenant || !['ACTIVE', 'TRIAL'].includes(tenant.status))
      throw new ForbiddenException('Tenant is not active');
    if (!(await this.pricing.isFeatureEnabled(tenantId, feature))) {
      throw new ForbiddenException(`Plan does not allow ${feature}`);
    }
  }

  async assertFlow(tenantId: string, flow: Flow, phase: 'publish' | 'execute'): Promise<void> {
    await this.assertFeature(tenantId, 'workflow');
    if (flow.type === 'whatsapp') await this.assertFeature(tenantId, 'whatsapp');
    if (!flow.definition.automation) return;
    let policy: WorkflowEntitlementPolicy;
    try {
      policy = this.moduleRef.get<WorkflowEntitlementPolicy>(WORKFLOW_ENTITLEMENT_POLICY, {
        strict: false,
      });
    } catch {
      throw new ForbiddenException('Automation installation entitlement policy is unavailable');
    }
    await policy.assertFlowEntitlement(tenantId, flow, phase);
  }

  async assertAction(
    tenantId: string,
    step: WorkflowStep,
    config: Record<string, unknown>,
  ): Promise<void> {
    await this.assertFeature(tenantId, 'workflow');
    const feature = step.type.startsWith('AI_')
      ? 'ai'
      : ['SEND_WHATSAPP', 'SEND_TEMPLATE', 'ASSIGN_AGENT', 'RESOLVE', 'WAIT_FOR_REPLY'].includes(
            step.type,
          )
        ? 'whatsapp'
        : step.type === 'INITIATE_CALL'
          ? 'voice'
          : [
                'CREATE_CONTACT',
                'UPDATE_CONTACT',
                'CREATE_DEAL',
                'UPDATE_DEAL',
                'MOVE_PIPELINE_STAGE',
                'ASSIGN_OWNER',
                'ADD_TAG',
                'CREATE_TASK',
                'CREATE_NOTE',
              ].includes(step.type)
            ? 'crm'
            : undefined;
    if (feature) await this.assertFeature(tenantId, feature);
    await this.assertReferences(tenantId, config, false);
  }

  /** Literal references are checked at publication; templates are checked after runtime resolution. */
  async assertReferences(
    tenantId: string,
    config: Record<string, unknown>,
    allowTemplates = true,
    manager?: EntityManager,
  ): Promise<void> {
    const em = manager ?? this.dataSource.manager;
    const referenceTypes = {
      contactId: Contact,
      dealId: Deal,
      companyId: Company,
      pipelineId: Pipeline,
      stageId: PipelineStage,
      toStageId: PipelineStage,
      agentId: Agent,
      ownerId: UserEntity,
      assigneeId: UserEntity,
      userId: UserEntity,
      templateId: WhatsAppTemplate,
    };
    for (const [key, entity] of Object.entries(referenceTypes)) {
      const value = config[key];
      if (value === undefined || value === null || value === '') continue;
      if (typeof value !== 'string') throw new BadRequestException(`${key} must be a UUID`);
      if (allowTemplates && value.includes('{{')) continue;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
        throw new BadRequestException(`Invalid ${key}`);
      const exists = await em
        .getRepository(entity)
        .createQueryBuilder('reference')
        .where('reference.id=:id AND reference.tenantId=:tenantId', { id: value, tenantId })
        .getCount();
      if (!exists) throw new ForbiddenException(`${key} does not belong to this tenant`);
    }
    if (config.knowledgeBaseIds !== undefined) {
      if (!Array.isArray(config.knowledgeBaseIds) || config.knowledgeBaseIds.length > 5)
        throw new BadRequestException('Invalid knowledgeBaseIds');
      for (const id of config.knowledgeBaseIds) {
        if (allowTemplates && typeof id === 'string' && id.includes('{{')) continue;
        if (
          typeof id !== 'string' ||
          !/^[0-9a-f-]{36}$/i.test(id) ||
          !(await em.getRepository(KnowledgeBase).findOneBy({ id, tenantId }))
        ) {
          throw new ForbiddenException('Knowledge base does not belong to this tenant');
        }
      }
    }
  }
}
