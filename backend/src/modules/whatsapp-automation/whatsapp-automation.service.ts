import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { EntityManager, Repository } from 'typeorm';
import { Flow } from '../../database/entities/flow.entity';
import { Plugin } from '../../database/entities/plugin.entity';
import { ProductEntitlement } from '../../database/entities/product-entitlement.entity';
import { TenantPlugin } from '../../database/entities/tenant-plugin.entity';
import { UserEntity, UserStatus } from '../auth/entities/user.entity';
import {
  WhatsAppTemplate,
  WhatsAppTemplateStatus,
} from '../../database/entities/whatsapp-template.entity';
import { WorkflowExecution } from '../../database/entities/workflow-execution.entity';
import { Agent } from '../../database/entities/agent.entity';
import { KnowledgeBase } from '../../database/entities/knowledge-base.entity';
import { Contact } from '../../database/entities/contact.entity';
import { BillingService } from '../billing/billing.service';
import { PricingService } from '../pricing/pricing.service';
import { WhatsappAccountService } from '../whatsapp/whatsapp-account.service';
import { WorkflowService } from '../workflow/workflow.service';
import type {
  AutomationAnalytics,
  AutomationCatalogProduct,
  AutomationInstallation,
  AutomationInstallationConfig,
  AutomationProductDefinition,
  AutomationReadiness,
} from './whatsapp-automation.contracts';
import {
  AUTOMATION_PLUGIN_CATEGORY,
  getAutomationDefinition,
  ALL_WHATSAPP_AUTOMATION_PRODUCTS,
  WHATSAPP_AUTOMATION_CATEGORY_OVERVIEW,
} from './whatsapp-automation.registry';
import {
  buildAutomationDefinition,
  validateAutomationConfig,
} from './whatsapp-automation.validation';

@Injectable()
export class WhatsappAutomationService {
  constructor(
    @InjectRepository(Plugin) private readonly plugins: Repository<Plugin>,
    @InjectRepository(TenantPlugin) private readonly installations: Repository<TenantPlugin>,
    @InjectRepository(ProductEntitlement)
    private readonly entitlements: Repository<ProductEntitlement>,
    private readonly workflows: WorkflowService,
    private readonly pricing: PricingService,
    private readonly billing: BillingService,
    private readonly accounts: WhatsappAccountService,
  ) {}

  async catalog(category?: string, search?: string): Promise<AutomationCatalogProduct[]> {
    const plugins = await this.plugins.find({
      where: { category: AUTOMATION_PLUGIN_CATEGORY, status: 'ACTIVE' },
    });
    const bySlug = new Map(plugins.map((plugin) => [plugin.slug, plugin]));
    const query = search?.trim().toLowerCase();
    return ALL_WHATSAPP_AUTOMATION_PRODUCTS.filter(
      (product) =>
        (!category || product.category === category) &&
        (!query || `${product.name} ${product.description}`.toLowerCase().includes(query)),
    ).map((product) => this.publicProduct(product, bySlug.get(product.slug)));
  }
  coverage() {
    return WHATSAPP_AUTOMATION_CATEGORY_OVERVIEW;
  }

  async detail(slug: string): Promise<AutomationCatalogProduct> {
    const product = this.definition(slug);
    const plugin = await this.plugins.findOne({
      where: { slug, category: AUTOMATION_PLUGIN_CATEGORY, status: 'ACTIVE' },
    });
    return this.publicProduct(product, plugin ?? undefined);
  }

  async installed(tenantId: string): Promise<AutomationInstallation[]> {
    const rows = await this.installations
      .createQueryBuilder('installation')
      .leftJoinAndSelect('installation.plugin', 'plugin')
      .where('installation.tenantId = :tenantId', { tenantId })
      .andWhere("installation.config->>'kind' = :kind", { kind: AUTOMATION_PLUGIN_CATEGORY })
      .orderBy('installation.createdAt', 'DESC')
      .getMany();
    return Promise.all(rows.map((row) => this.publicInstallation(tenantId, row)));
  }

  async preview(
    tenantId: string,
    slug: string,
    input: unknown,
    payload: Record<string, unknown> = {},
  ) {
    const product = this.definition(slug);
    if (product.availability !== 'IMPLEMENTED')
      throw new BadRequestException('Required integration is not implemented');
    const settings = validateAutomationConfig(product, input);
    await this.assertOwnedResources(tenantId, settings);
    const account = (await this.accounts.list(tenantId)).find(
      (row) => row.id === settings.accountId,
    );
    if (!account)
      throw new BadRequestException('Choose a WhatsApp account owned by this workspace');
    const plugin = await this.activePlugin(slug);
    const definition = buildAutomationDefinition(product, settings, account.phoneNumberId, {
      installationId: randomUUID(),
      pluginId: plugin.id,
    });
    return {
      ...(await this.workflows.preview(tenantId, { definition, payload })),
      readiness: await this.readiness(tenantId, product, settings, plugin),
    };
  }

  async executions(tenantId: string, id: string) {
    const config = this.installationConfig(await this.row(tenantId, id));
    return this.workflows.getExecutions(tenantId, config.flowId);
  }

  async run(tenantId: string, id: string, payload: Record<string, unknown>, requestId: string) {
    const config = this.installationConfig(await this.row(tenantId, id));
    if (config.state !== 'ACTIVE')
      throw new ConflictException('Activate this automation before running it');
    if (this.definition(config.slug).trigger !== 'MANUAL')
      throw new BadRequestException('This automation starts from its configured business event');
    if (payload.contactId !== undefined) {
      if (typeof payload.contactId !== 'string' || !/^[0-9a-f-]{36}$/i.test(payload.contactId))
        throw new BadRequestException('Choose a valid workspace contact');
      const contact = await this.installations.manager
        .getRepository(Contact)
        .findOneBy({ tenantId, id: payload.contactId });
      if (!contact) throw new BadRequestException('Contact must belong to this workspace');
      const phone = contact.mobile?.trim() || contact.phone?.trim();
      payload = { ...payload, contact: { ...contact, phone }, phone };
    }
    return this.workflows.triggerWorkflow(
      tenantId,
      'MANUAL',
      payload,
      config.flowId,
      `automation:${id}:${requestId}`,
    );
  }

  async install(tenantId: string, slug: string, input: unknown): Promise<AutomationInstallation> {
    const product = this.definition(slug);
    if (product.availability !== 'IMPLEMENTED')
      throw new BadRequestException(
        'This product requires an unimplemented integration and cannot be installed',
      );
    const settings = validateAutomationConfig(product, input);
    const plugin = await this.activePlugin(slug);
    await this.assertProductAccess(tenantId, plugin, product);
    const account = (await this.accounts.list(tenantId)).find(
      (row) => row.id === settings.accountId,
    );
    if (!account)
      throw new BadRequestException('Choose a WhatsApp account owned by this workspace');
    await this.assertOwnedResources(tenantId, settings);

    const row = await this.installations.manager.transaction(async (manager) => {
      await this.lock(manager, tenantId, plugin.id);
      // Recheck paid ownership inside the installation transaction, after acquiring the lifecycle lock.
      await this.assertProductAccess(tenantId, plugin, product, manager);
      const repository = manager.getRepository(TenantPlugin);
      const existing = await repository.findOne({ where: { tenantId, pluginId: plugin.id } });
      const installationId = existing?.id ?? randomUUID();
      const definition = buildAutomationDefinition(product, settings, account.phoneNumberId, {
        installationId,
        pluginId: plugin.id,
      });
      if (existing) {
        const prior = this.installationConfig(existing);
        if (prior.version !== product.version)
          throw new ConflictException(
            'Installed version differs; explicitly uninstall before installing the new version',
          );
        if (prior.state !== 'UNINSTALLED') {
          if (this.canonical(prior.settings) !== this.canonical(settings))
            throw new ConflictException(
              'Already installed with different configuration; update the installation explicitly',
            );
          return existing;
        }
        const flow = await manager
          .getRepository(Flow)
          .findOne({ where: { id: prior.flowId, tenantId } });
        if (!flow)
          throw new ConflictException(
            'Installed workflow is missing; administrative recovery is required',
          );
        flow.definition = definition;
        flow.isPublished = false;
        await manager.getRepository(Flow).save(flow);
        existing.isEnabled = true;
        existing.installedAt = new Date();
        existing.config = {
          kind: AUTOMATION_PLUGIN_CATEGORY,
          slug,
          version: product.version,
          flowId: flow.id,
          state: 'DRAFT',
          settings,
        };
        return repository.save(existing);
      }
      const flow = await this.workflows.create(
        tenantId,
        {
          name: product.name,
          description: product.description,
          type: 'whatsapp',
          definition,
          isPublished: false,
        },
        manager,
      );
      return repository.save(
        repository.create({
          id: installationId,
          tenantId,
          pluginId: plugin.id,
          isEnabled: true,
          installedAt: new Date(),
          config: {
            kind: AUTOMATION_PLUGIN_CATEGORY,
            slug,
            version: product.version,
            flowId: flow.id,
            state: 'DRAFT',
            settings,
          },
        }),
      );
    });
    return this.publicInstallation(tenantId, row);
  }

  async configure(tenantId: string, id: string, input: unknown): Promise<AutomationInstallation> {
    const initial = await this.row(tenantId, id);
    const config = this.installationConfig(initial);
    const product = this.definition(config.slug);
    const settings = validateAutomationConfig(product, input);
    const account = (await this.accounts.list(tenantId)).find(
      (row) => row.id === settings.accountId,
    );
    if (!account)
      throw new BadRequestException('Choose a WhatsApp account owned by this workspace');
    await this.assertOwnedResources(tenantId, settings);
    const row = await this.installations.manager.transaction(async (manager) => {
      await this.lock(manager, tenantId, initial.pluginId);
      const current = await this.row(tenantId, id, manager);
      const stored = this.installationConfig(current);
      if (stored.state === 'UNINSTALLED')
        throw new ConflictException('Reinstall this product before configuring it');
      if (stored.version !== product.version)
        throw new ConflictException('Product version changed; reinstall before configuring');
      const definition = buildAutomationDefinition(product, settings, account.phoneNumberId, {
        installationId: id,
        pluginId: current.pluginId,
      });
      // Configuration edits always return the linked flow to draft. Runtime checks block old queued work.
      const flow = await manager
        .getRepository(Flow)
        .findOne({ where: { id: stored.flowId, tenantId } });
      if (!flow)
        throw new ConflictException(
          'Installed workflow is missing; administrative recovery is required',
        );
      flow.definition = definition;
      flow.isPublished = false;
      await manager.getRepository(Flow).save(flow);
      current.config = { ...stored, settings, state: 'DRAFT' };
      current.isEnabled = true;
      return manager.getRepository(TenantPlugin).save(current);
    });
    return this.publicInstallation(tenantId, row);
  }

  async activate(tenantId: string, id: string): Promise<AutomationInstallation> {
    const initial = await this.row(tenantId, id);
    if (this.installationConfig(initial).state === 'DISABLED') {
      await this.configure(tenantId, id, this.installationConfig(initial).settings);
    }
    const row = await this.installations.manager.transaction(async (manager) => {
      await this.lock(manager, tenantId, initial.pluginId);
      const current = await this.row(tenantId, id, manager);
      const config = this.installationConfig(current);
      if (config.state === 'UNINSTALLED')
        throw new ConflictException('Reinstall this product before activation');
      const product = this.definition(config.slug);
      const plugin = await this.activePlugin(config.slug);
      await this.assertProductAccess(tenantId, plugin, product, manager);
      const readiness = await this.readiness(tenantId, product, config.settings, plugin);
      if (!readiness.ready)
        throw new BadRequestException({
          code: 'AUTOMATION_NOT_READY',
          message: 'Resolve prerequisites before activation',
          ...readiness,
        });
      if (config.state === 'DISABLED')
        throw new ConflictException(
          'Installation was disabled during activation; retry explicitly',
        );
      await this.workflows.activate(tenantId, config.flowId, manager);
      current.isEnabled = true;
      current.config = { ...config, state: 'ACTIVE' };
      return manager.getRepository(TenantPlugin).save(current);
    });
    await this.workflows.resumeExecutions(tenantId, this.installationConfig(row).flowId);
    return this.publicInstallation(tenantId, row);
  }

  async disable(tenantId: string, id: string, uninstall = false): Promise<AutomationInstallation> {
    const initial = await this.row(tenantId, id);
    const row = await this.installations.manager.transaction(async (manager) => {
      await this.lock(manager, tenantId, initial.pluginId);
      const current = await this.row(tenantId, id, manager);
      const config = this.installationConfig(current);
      await manager
        .getRepository(Flow)
        .update({ tenantId, id: config.flowId }, { isPublished: false });
      current.isEnabled = false;
      current.config = {
        ...config,
        state: uninstall
          ? 'UNINSTALLED'
          : config.state === 'UNINSTALLED'
            ? 'UNINSTALLED'
            : 'DISABLED',
      };
      return manager.getRepository(TenantPlugin).save(current);
    });
    // Retain installation, resource IDs, execution history and purchased entitlement.
    return this.publicInstallation(tenantId, row);
  }

  async checkout(tenantId: string, slug: string) {
    const product = this.definition(slug);
    if (product.availability !== 'IMPLEMENTED')
      throw new BadRequestException('Unimplemented products cannot be purchased');
    const plugin = await this.activePlugin(slug);
    if (!plugin.isPremium)
      throw new BadRequestException(
        'This automation is included in your eligible plan; no product checkout is needed',
      );
    for (const feature of product.requiredFeatures) {
      if (!(await this.pricing.isFeatureEnabled(tenantId, feature)))
        throw new ForbiddenException(
          `Your plan must include ${feature} before purchasing this automation`,
        );
    }
    return this.billing.createProductCheckoutSession(tenantId, plugin.id, product.version);
  }

  /** Optional WORKFLOW_ENTITLEMENT_POLICY contract. Called at publication and before runtime actions. */
  async assertFlowEntitlement(
    tenantId: string,
    flow: Flow,
    phase: 'publish' | 'execute' = 'execute',
  ): Promise<void> {
    const marker = flow.definition?.automation as Record<string, unknown> | undefined;
    if (!marker) return;
    if (typeof marker.installationId !== 'string')
      throw new ForbiddenException('Invalid automation installation linkage');
    const row = await this.row(tenantId, marker.installationId);
    const config = this.installationConfig(row);
    if (
      config.flowId !== flow.id ||
      marker.pluginId !== row.pluginId ||
      marker.slug !== config.slug ||
      marker.version !== config.version
    ) {
      throw new ForbiddenException('Workflow does not match its automation installation');
    }
    if (
      !row.isEnabled ||
      config.state === 'UNINSTALLED' ||
      (phase === 'execute' && config.state !== 'ACTIVE')
    ) {
      throw new ForbiddenException('Automation installation is not active');
    }
    const product = this.definition(config.slug);
    if (config.version !== product.version)
      throw new ForbiddenException('Automation version requires reinstallation');
    const plugin = await this.activePlugin(config.slug);
    await this.assertProductAccess(tenantId, plugin, product);
    const readiness = await this.readiness(tenantId, product, config.settings, plugin);
    if (!readiness.ready)
      throw new ForbiddenException({ code: 'AUTOMATION_NOT_READY', ...readiness });
  }

  private async readiness(
    tenantId: string,
    product: AutomationProductDefinition,
    settings: Record<string, unknown>,
    plugin?: Plugin,
  ): Promise<AutomationReadiness> {
    const issues: AutomationReadiness['issues'] = [];
    if (product.availability !== 'IMPLEMENTED')
      issues.push({
        code: 'EXTERNAL_REQUIREMENT',
        message: 'Required integration is not implemented',
      });
    for (const feature of product.requiredFeatures) {
      if (!(await this.pricing.isFeatureEnabled(tenantId, feature)))
        issues.push({
          code: 'PLAN_FEATURE_REQUIRED',
          message: `Plan feature ${feature} is required`,
        });
    }
    if (!plugin || plugin.status !== 'ACTIVE')
      issues.push({
        code: 'PRODUCT_UNAVAILABLE',
        message: 'Product is not active in the marketplace catalog',
      });
    else if (plugin.isPremium && !(await this.hasPaidEntitlement(tenantId, plugin.id)))
      issues.push({
        code: 'PAYMENT_REQUIRED',
        message: 'A verified paid product entitlement is required',
      });
    try {
      validateAutomationConfig(product, settings);
      const selected = (await this.accounts.list(tenantId)).find(
        (account) => account.id === settings.accountId,
      );
      if (!selected || selected.status !== 'CONNECTED') {
        issues.push({
          code: 'ACCOUNT_REQUIRED',
          field: 'accountId',
          message: 'Connect the selected workspace WhatsApp account',
        });
      } else {
        await this.accounts.getCredentials(tenantId, selected.phoneNumberId);
        if (
          (product.actions.some((action) => action.type === 'SEND_MESSAGE') &&
            !selected.capabilities.text) ||
          (product.actions.some((action) => action.type === 'SEND_TEMPLATE') &&
            !selected.capabilities.template)
        ) {
          issues.push({
            code: 'CAPABILITY_UNAVAILABLE',
            message: 'The selected provider does not implement the required message capability',
          });
        }
      }
      await this.assertOwnedResources(tenantId, settings);
      if (typeof settings.templateId === 'string') {
        const template = await this.installations.manager
          .getRepository(WhatsAppTemplate)
          .findOne({ where: { tenantId, id: settings.templateId } });
        if (
          !template ||
          template.status !== WhatsAppTemplateStatus.APPROVED ||
          !template.waTemplateId
        ) {
          issues.push({
            code: 'TEMPLATE_APPROVAL_REQUIRED',
            field: 'templateId',
            message: 'Select a Meta-approved template with a provider template ID',
          });
        } else if (template.businessAccountId !== selected?.businessAccountId) {
          issues.push({
            code: 'TEMPLATE_ACCOUNT_MISMATCH',
            field: 'templateId',
            message: 'Select a template synchronized with the selected WhatsApp business account',
          });
        } else if (template.category !== product.templatePurpose) {
          issues.push({
            code: 'TEMPLATE_PURPOSE_MISMATCH',
            field: 'templateId',
            message: `Select a ${product.templatePurpose} template`,
          });
        } else {
          const raw = template.components;
          const components: unknown[] = Array.isArray(raw)
            ? raw
            : Array.isArray(raw.components)
              ? raw.components
              : [];
          const body = components.find(
            (component) =>
              component &&
              typeof component === 'object' &&
              (component as Record<string, unknown>).type === 'BODY',
          ) as Record<string, unknown> | undefined;
          if (components.length !== 1 || !body || typeof body.text !== 'string') {
            issues.push({
              code: 'TEMPLATE_CAPABILITY_UNSUPPORTED',
              field: 'templateId',
              message: 'This product supports basic BODY-only templates, without buttons or media',
            });
          } else {
            const needed = new Set(
              [...body.text.matchAll(/\{\{(\d+)\}\}/g)].map((match) => Number(match[1])),
            ).size;
            const parameters = JSON.parse(String(settings.templateParameters ?? '[]')) as unknown[];
            if (parameters.length !== needed)
              issues.push({
                code: 'TEMPLATE_PARAMETERS_REQUIRED',
                field: 'templateParameters',
                message: `Supply ${needed} body parameters in placeholder order`,
              });
          }
        }
      }
    } catch {
      issues.push({
        code: 'CONFIGURATION_REQUIRED',
        message: 'Review configuration, resource ownership and account credentials',
      });
    }
    return { ready: issues.length === 0, issues };
  }

  private async assertOwnedResources(
    tenantId: string,
    settings: Record<string, unknown>,
  ): Promise<void> {
    if (
      typeof settings.agentId === 'string' &&
      !(await this.installations.manager
        .getRepository(Agent)
        .existsBy({ id: settings.agentId, tenantId, isActive: true }))
    ) {
      throw new BadRequestException('AI agent must be active and belong to this workspace');
    }
    if (
      typeof settings.knowledgeBaseId === 'string' &&
      !(await this.installations.manager
        .getRepository(KnowledgeBase)
        .existsBy({ id: settings.knowledgeBaseId, tenantId }))
    ) {
      throw new BadRequestException('Knowledge base must belong to this workspace');
    }
    if (
      typeof settings.templateId === 'string' &&
      !(await this.installations.manager
        .getRepository(WhatsAppTemplate)
        .existsBy({ id: settings.templateId, tenantId }))
    ) {
      throw new BadRequestException('Template must belong to this workspace');
    }
    if (
      typeof settings.assigneeId === 'string' &&
      !(await this.installations.manager
        .getRepository(UserEntity)
        .existsBy({ id: settings.assigneeId, tenantId, status: UserStatus.ACTIVE }))
    ) {
      throw new BadRequestException('Assignee must be an active user in this workspace');
    }
  }

  private async assertProductAccess(
    tenantId: string,
    plugin: Plugin,
    product: AutomationProductDefinition,
    manager?: EntityManager,
  ): Promise<void> {
    for (const feature of product.requiredFeatures) {
      if (!(await this.pricing.isFeatureEnabled(tenantId, feature)))
        throw new ForbiddenException(`Plan feature ${feature} is required`);
    }
    if (plugin.isPremium && !(await this.hasPaidEntitlement(tenantId, plugin.id, manager))) {
      throw new ForbiddenException({
        code: 'PRODUCT_ENTITLEMENT_REQUIRED',
        message: 'Complete verified product checkout before installing this paid automation',
      });
    }
  }

  private async hasPaidEntitlement(
    tenantId: string,
    pluginId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repository = manager?.getRepository(ProductEntitlement) ?? this.entitlements;
    return repository
      .createQueryBuilder('entitlement')
      .where('entitlement.tenantId = :tenantId', { tenantId })
      .andWhere('entitlement.pluginId = :pluginId', { pluginId })
      .andWhere('entitlement.status = :status', { status: 'ACTIVE' })
      .andWhere('entitlement.lastEventId IS NOT NULL')
      .andWhere('(entitlement.expiresAt IS NULL OR entitlement.expiresAt > now())')
      .getExists();
  }

  private definition(slug: string): AutomationProductDefinition {
    const product = getAutomationDefinition(slug);
    if (!product) throw new NotFoundException('WhatsApp automation not found');
    return product;
  }

  private async activePlugin(slug: string): Promise<Plugin> {
    const plugin = await this.plugins.findOne({
      where: { slug, category: AUTOMATION_PLUGIN_CATEGORY, status: 'ACTIVE' },
    });
    if (!plugin)
      throw new NotFoundException(
        'Automation catalog entry is not configured; apply the catalog migration',
      );
    return plugin;
  }

  private publicProduct(
    product: AutomationProductDefinition,
    plugin?: Plugin,
  ): AutomationCatalogProduct {
    return {
      id: plugin?.id ?? null,
      slug: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      version: product.version,
      availability: product.availability,
      requiredFeatures: [...product.requiredFeatures],
      externalRequirements: product.externalRequirements,
      configSchema: product.configSchema,
      steps: product.steps,
      trigger: product.trigger,
      pricing: {
        model: plugin?.isPremium ? 'PAID' : 'PLAN_INCLUDED',
        amount: null,
        currency: null,
        interval: null,
        // Amount/currency come from the verified Stripe price at checkout, never invented from priceMonthly.
        checkoutAvailable:
          !!plugin?.isPremium &&
          !!plugin.stripePriceId &&
          this.billing.isProductCheckoutConfigured() &&
          product.availability === 'IMPLEMENTED',
      },
    };
  }

  private async row(tenantId: string, id: string, manager?: EntityManager): Promise<TenantPlugin> {
    const row = await (manager?.getRepository(TenantPlugin) ?? this.installations).findOne({
      where: { tenantId, id },
    });
    if (!row || row.config.kind !== AUTOMATION_PLUGIN_CATEGORY)
      throw new NotFoundException('Automation installation not found');
    return row;
  }

  private installationConfig(row: TenantPlugin): AutomationInstallationConfig {
    const config = row.config;
    if (
      config.kind !== AUTOMATION_PLUGIN_CATEGORY ||
      typeof config.slug !== 'string' ||
      typeof config.version !== 'string' ||
      typeof config.flowId !== 'string' ||
      !config.settings ||
      typeof config.settings !== 'object' ||
      !['DRAFT', 'ACTIVE', 'DISABLED', 'UNINSTALLED'].includes(String(config.state))
    ) {
      throw new ConflictException('Installation linkage requires administrative recovery');
    }
    return config as AutomationInstallationConfig;
  }

  private async publicInstallation(
    tenantId: string,
    row: TenantPlugin,
  ): Promise<AutomationInstallation> {
    const config = this.installationConfig(row);
    const product = this.definition(config.slug);
    const plugin = row.plugin ?? (await this.plugins.findOne({ where: { id: row.pluginId } }));
    const counts = await this.installations.manager
      .getRepository(WorkflowExecution)
      .createQueryBuilder('run')
      .select('run.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('MAX(run.startedAt)', 'lastExecutedAt')
      .where('run.tenantId = :tenantId AND run.flowId = :flowId', {
        tenantId,
        flowId: config.flowId,
      })
      .groupBy('run.status')
      .getRawMany<{ status: string; count: string; lastExecutedAt: Date | string }>();
    const analytics: AutomationAnalytics = {
      total: 0,
      completed: 0,
      failed: 0,
      running: 0,
      paused: 0,
      cancelled: 0,
      lastExecutedAt: null,
    };
    for (const run of counts) {
      const count = Number(run.count);
      analytics.total += count;
      if (run.status === 'COMPLETED') analytics.completed += count;
      if (run.status === 'FAILED') analytics.failed += count;
      if (run.status === 'RUNNING' || run.status === 'QUEUED') analytics.running += count;
      if (run.status === 'PAUSED') analytics.paused += count;
      if (run.status === 'CANCELLED') analytics.cancelled += count;
      const date = new Date(run.lastExecutedAt).toISOString();
      if (!analytics.lastExecutedAt || date > analytics.lastExecutedAt)
        analytics.lastExecutedAt = date;
    }
    return {
      id: row.id,
      pluginId: row.pluginId,
      slug: config.slug,
      name: product.name,
      version: config.version,
      flowId: config.flowId,
      isEnabled: row.isEnabled,
      state: config.state,
      config: config.settings,
      readiness: await this.readiness(tenantId, product, config.settings, plugin ?? undefined),
      analytics,
    };
  }

  private lock(manager: EntityManager, tenantId: string, pluginId: string) {
    return manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      `whatsapp-automation:${tenantId}:${pluginId}`,
    ]);
  }

  private canonical(value: Record<string, unknown>): string {
    return JSON.stringify(
      Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))),
    );
  }
}
