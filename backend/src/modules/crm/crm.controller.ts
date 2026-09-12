import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';

import { AgentService } from './agent.service';
import { CampaignService } from './campaign.service';
import { CsvService } from './csv.service';
import { FlowService } from './flow.service';
import { LeadService } from './lead.service';
import { ContactService } from './contact.service';
import { CompanyService } from './company.service';
import { DealService } from './deal.service';
import { PipelineService } from './pipeline.service';
import {
  ActivityService,
  TaskCrmService,
  NoteService,
  ProductService,
  QuoteService,
  CampaignCrmService,
  AnalyticsCrmService,
  EmailCrmService,
  BulkCrmService,
  TagService,
  SegmentService,
  CustomFieldService,
} from './crm-support.service';
import { ForecastService } from './forecast.service';
import { QuoteLifecycleService } from './quote-lifecycle.service';
import {
  CreateContactDto,
  UpdateContactDto,
  CreateCompanyDto,
  UpdateCompanyDto,
  CreateDealDto,
  UpdateDealDto,
  CreateLeadDto,
  UpdateLeadDto,
  BulkCreateLeadsDto,
  ConvertLeadDto,
  CreateTaskDto,
  UpdateTaskDto,
  CreateNoteDto,
  CreateActivityDto,
  CreateProductDto,
  UpdateProductDto,
  CreateQuoteDto,
  UpdateQuoteDto,
  CreatePipelineDto,
  UpdatePipelineDto,
  CreatePipelineStageDto,
  CreateCampaignDto,
  UpdateCampaignDto,
  StartCampaignDto,
  CreateTagDto,
  CreateSegmentDto,
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  MergeRecordsDto,
  BulkStatusDto,
  BulkDeleteDto,
  ImportCrmDataDto,
  SendCrmEmailDto,
  CrmListQueryDto,
} from './dto/crm.dto';
import { MoveDealStageDto, MarkDealLostDto, CreateContactNoteDto } from './dto/deal-lifecycle.dto';
import { DealProductService } from './deal-product.service';
import { AddDealProductDto } from './dto/deal-product.dto';
import { SendQuoteDto } from './dto/quote-lifecycle.dto';
import { LeadConversionService } from './services/lead-conversion.service';
import {
  TenantId,
  Roles,
  ResourcePermissions,
  PlanFeature,
  Limit,
  CurrentUser,
} from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { wantsPagination } from '../../common/utils/pagination.util';
import { IRequestContext } from '../../common/interfaces/request-context.interface';

@ApiTags('CRM & AI Agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('crm')
@PlanFeature('crm')
@Controller('crm')
export class CrmController {
  constructor(
    private readonly agentService: AgentService,
    private readonly flowService: FlowService,
    private readonly leadService: LeadService,
    private readonly csvService: CsvService,
    private readonly campaignService: CampaignService,
    private readonly contactService: ContactService,
    private readonly companyService: CompanyService,
    private readonly dealService: DealService,
    private readonly pipelineService: PipelineService,
    private readonly activityService: ActivityService,
    private readonly taskService: TaskCrmService,
    private readonly noteService: NoteService,
    private readonly productService: ProductService,
    private readonly quoteService: QuoteService,
    private readonly campaignCrmService: CampaignCrmService,
    private readonly analyticsService: AnalyticsCrmService,
    private readonly emailService: EmailCrmService,
    private readonly bulkService: BulkCrmService,
    private readonly tagService: TagService,
    private readonly segmentService: SegmentService,
    private readonly customFieldService: CustomFieldService,
    private readonly forecastService: ForecastService,
    private readonly quoteLifecycleService: QuoteLifecycleService,
    private readonly dealProductService: DealProductService,
    private readonly leadConversionService: LeadConversionService,
  ) {}

  // --- Agents ---
  @Get('agents')
  @ApiOperation({ summary: 'Get all AI agents' })
  getAgents(@TenantId() tenantId: string) {
    return this.agentService.findAll(tenantId);
  }

  @Get('agents/templates')
  @ApiOperation({ summary: 'Get all AI agent templates' })
  getAgentTemplates() {
    return this.agentService.getTemplates();
  }

  @Post('agents/templates/:templateId/deploy')
  @ApiOperation({ summary: 'Deploy a new AI agent from template' })
  deployAgent(@TenantId() tenantId: string, @Param('templateId') templateId: string) {
    return this.agentService.createFromTemplate(tenantId, templateId);
  }

  @Post('agents/templates/:templateId/install')
  @ApiOperation({ summary: 'Install a new AI agent from template' })
  installAgent(@TenantId() tenantId: string, @Param('templateId') templateId: string) {
    return this.agentService.createFromTemplate(tenantId, templateId);
  }

  @Get('agents/:id')
  @ApiOperation({ summary: 'Get a specific AI agent by ID' })
  getAgent(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.agentService.findOne(tenantId, id);
  }

  @Post('agents')
  @ApiOperation({ summary: 'Create a new AI agent' })
  createAgent(@TenantId() tenantId: string, @Body() data: any) {
    return this.agentService.create(tenantId, data);
  }

  @Patch('agents/:id')
  @ApiOperation({ summary: 'Update an AI agent' })
  updateAgent(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.agentService.update(tenantId, id, data);
  }

  @Delete('agents/:id')
  @ApiOperation({ summary: 'Delete an AI agent' })
  deleteAgent(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.agentService.remove(tenantId, id);
  }

  // --- Flows ---
  @Get('flows')
  @ApiOperation({ summary: 'Get all conversation flows' })
  getFlows(@TenantId() tenantId: string) {
    return this.flowService.findAll(tenantId);
  }

  @Get('flows/:id')
  @ApiOperation({ summary: 'Get a specific flow' })
  getFlow(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.flowService.findOne(tenantId, id);
  }

  @Post('flows')
  @ApiOperation({ summary: 'Save a visual conversation flow' })
  createFlow(@TenantId() tenantId: string, @Body() data: any) {
    return this.flowService.create(tenantId, data);
  }

  @Put('flows/:id')
  @ApiOperation({ summary: 'Update a flow' })
  updateFlow(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.flowService.update(tenantId, id, data);
  }

  @Delete('flows/:id')
  @ApiOperation({ summary: 'Delete a flow' })
  deleteFlow(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.flowService.remove(tenantId, id);
  }

  // --- Bulk Campaigns ---
  // --- Contacts ---
  @Get('contacts')
  @ApiOperation({ summary: 'Get all contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContacts(@TenantId() tenantId: string, @Query() query: CrmListQueryDto) {
    if (wantsPagination(query) || query.search || query.status || query.companyId) {
      return this.contactService.findPaginated(tenantId, {
        ...query,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      });
    }
    return await this.contactService.findAll(tenantId);
  }

  @Post('contacts')
  @Limit('contacts_limit')
  @ApiOperation({ summary: 'Create contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  @Limit('contacts')
  async createContact(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() dto: CreateContactDto,
  ) {
    return await this.contactService.create(tenantId, dto, actor.userId);
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContact(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.contactService.findOne(tenantId, id);
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Update contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async updateContact(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return await this.contactService.update(tenantId, id, dto, actor.userId);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Delete contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteContact(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
  ) {
    await this.contactService.remove(tenantId, id, actor.userId);
    return { success: true };
  }

  @Get('contacts/:id/activities')
  @ApiOperation({ summary: 'Get contact activity feed' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactActivities(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.contactService.getActivities(tenantId, id);
  }

  @Get('contacts/:id/deals')
  @ApiOperation({ summary: 'Get deals linked to contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactDeals(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.contactService.getDeals(tenantId, id);
  }

  @Get('contacts/:id/notes')
  @ApiOperation({ summary: 'Get notes for contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactNotes(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.contactService.getNotes(tenantId, id);
  }

  @Post('contacts/:id/notes')
  @ApiOperation({ summary: 'Create note for contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createContactNote(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: CreateContactNoteDto,
  ) {
    return await this.contactService.createNote(tenantId, id, dto);
  }

  @Get('contacts/:id/calls')
  @ApiOperation({ summary: 'Get call history for contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactCalls(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.contactService.getCalls(tenantId, id);
  }

  @Get('contacts/:id/emails')
  @ApiOperation({ summary: 'Get email history for contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactEmails(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.contactService.getEmails(tenantId, id);
  }

  @Get('contacts/:id/whatsapp')
  @ApiOperation({ summary: 'Get WhatsApp history for contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactWhatsapp(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.contactService.getWhatsappMessages(tenantId, id);
  }

  @Post('contacts/merge')
  @ApiOperation({ summary: 'Merge two contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async mergeContacts(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() body: MergeRecordsDto,
  ) {
    return await this.contactService.mergeContacts(
      tenantId,
      body.primaryId,
      body.secondaryId,
      actor.userId,
    );
  }

  // --- Companies ---
  @Get('companies')
  @ApiOperation({ summary: 'Get all companies' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompanies(@TenantId() tenantId: string, @Query() query: CrmListQueryDto) {
    if (wantsPagination(query) || query.search) {
      return this.companyService.findPaginated(tenantId, {
        ...query,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      });
    }
    return await this.companyService.findAll(tenantId);
  }

  @Post('companies')
  @ApiOperation({ summary: 'Create company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createCompany(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() dto: CreateCompanyDto,
  ) {
    return await this.companyService.create(tenantId, dto, actor.userId);
  }

  @Post('companies/merge')
  @ApiOperation({ summary: 'Merge two companies' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async mergeCompanies(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() body: MergeRecordsDto,
  ) {
    return await this.companyService.mergeCompanies(
      tenantId,
      body.primaryId,
      body.secondaryId,
      actor.userId,
    );
  }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company by ID' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompany(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.companyService.findOne(tenantId, id);
  }

  @Put('companies/:id')
  @ApiOperation({ summary: 'Update company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async updateCompany(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return await this.companyService.update(tenantId, id, dto, actor.userId);
  }

  @Delete('companies/:id')
  @ApiOperation({ summary: 'Delete company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteCompany(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
  ) {
    await this.companyService.delete(tenantId, id, actor.userId);
    return { success: true };
  }

  @Get('companies/:id/contacts')
  @ApiOperation({ summary: 'Get contacts at company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompanyContacts(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.companyService.getContacts(tenantId, id);
  }

  @Get('companies/:id/deals')
  @ApiOperation({ summary: 'Get deals for company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompanyDeals(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.companyService.getDeals(tenantId, id);
  }

  @Get('companies/:id/activities')
  @ApiOperation({ summary: 'Get company activity timeline' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompanyActivities(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.companyService.getActivities(tenantId, id);
  }

  // --- Deals ---

  @Get('deals/board')
  @ApiOperation({ summary: 'Get deal board data (Kanban)' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDealBoard(@TenantId() tenantId: string, @Query('pipelineId') pipelineId: string) {
    return await this.dealService.getBoard(tenantId, pipelineId);
  }

  @Get('deals')
  @ApiOperation({ summary: 'Get all deals' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDeals(@TenantId() tenantId: string, @Query() query: CrmListQueryDto) {
    if (
      wantsPagination(query) ||
      query.search ||
      query.status ||
      query.pipelineId ||
      query.companyId
    ) {
      return this.dealService.findPaginated(tenantId, {
        ...query,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      });
    }
    return await this.dealService.findAll(tenantId, query.pipelineId);
  }

  @Post('deals')
  @Limit('deals_limit')
  @ApiOperation({ summary: 'Create deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createDeal(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() dto: CreateDealDto,
  ) {
    return await this.dealService.create(tenantId, dto, actor.userId);
  }

  @Get('deals/:id')
  @ApiOperation({ summary: 'Get deal by ID' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDeal(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.dealService.findOne(tenantId, id);
  }

  @Put('deals/:id')
  @ApiOperation({ summary: 'Update deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async updateDeal(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return await this.dealService.update(tenantId, id, dto, actor.userId);
  }

  @Delete('deals/:id')
  @ApiOperation({ summary: 'Delete deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteDeal(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
  ) {
    await this.dealService.remove(tenantId, id, actor.userId);
    return { success: true };
  }

  @Patch('deals/:id/stage')
  @ApiOperation({ summary: 'Move deal to another pipeline stage' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async moveDealStage(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
    @Body() dto: MoveDealStageDto,
  ) {
    return await this.dealService.moveStage(
      tenantId,
      id,
      dto.stageId,
      actor.userId,
      dto.reason,
    );
  }

  @Patch('deals/:id/won')
  @ApiOperation({ summary: 'Mark deal as won' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async markDealWon(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
  ) {
    return await this.dealService.markWon(tenantId, id, actor.userId);
  }

  @Patch('deals/:id/lost')
  @ApiOperation({ summary: 'Mark deal as lost' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async markDealLost(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
    @Body() dto: MarkDealLostDto,
  ) {
    return await this.dealService.markLost(tenantId, id, dto.lostReason, actor.userId);
  }

  @Get('deals/:id/products')
  @ApiOperation({ summary: 'Get products linked to deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDealProducts(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.dealProductService.listProducts(tenantId, id);
  }

  @Get('deals/:id/activities')
  @ApiOperation({ summary: 'Get activities linked to deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDealActivities(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.activityService.findByDeal(tenantId, id);
  }

  @Post('deals/:id/products')
  @ApiOperation({ summary: 'Add product to deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async addDealProduct(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AddDealProductDto,
  ) {
    return await this.dealProductService.addProduct(tenantId, id, dto);
  }

  @Delete('deals/:id/products/:productId')
  @ApiOperation({ summary: 'Remove product from deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async removeDealProduct(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    await this.dealProductService.removeProduct(tenantId, id, productId);
    return null;
  }

  @Post('campaigns/start')
  @ApiOperation({ summary: 'Start a bulk AI calling campaign' })
  startCampaign(@TenantId() tenantId: string, @Body() body: StartCampaignDto) {
    return this.campaignService.startBulkCampaign(tenantId, body.agentId, body.leadIds);
  }

  // --- Activities ---
  @Get('activities')
  @ApiOperation({ summary: 'Get recent CRM activities' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getActivities(@TenantId() tenantId: string) {
    return await this.activityService.findAll(tenantId);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get unified calendar events' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCalendar(@TenantId() tenantId: string) {
    const activities = await this.activityService.findAll(tenantId);
    const tasks = await this.taskService.findAll(tenantId);

    return [
      ...activities.map((a: any) => ({
        id: a.id,
        title: a.subject,
        start: a.occurredAt,
        type: a.type.toLowerCase(),
        description: a.description,
      })),
      ...tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        start: t.dueDate,
        type: 'task',
        description: t.description,
      })),
    ];
  }

  @Post('activities')
  @ApiOperation({ summary: 'Log activity' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createActivity(@TenantId() tenantId: string, @Body() dto: CreateActivityDto) {
    return await this.activityService.create(tenantId, dto);
  }

  // --- Tasks ---
  @Get('tasks')
  @ApiOperation({ summary: 'Get all CRM tasks' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getTasks(@TenantId() tenantId: string, @Query() query: CrmListQueryDto) {
    if (wantsPagination(query) || query.search || query.status) {
      return await this.taskService.findPaginated(tenantId, {
        ...query,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      });
    }
    return await this.taskService.findAll(tenantId);
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create CRM task' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createTask(@TenantId() tenantId: string, @Body() dto: CreateTaskDto) {
    return await this.taskService.create(tenantId, dto);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get task by ID' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getTask(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.taskService.findOne(tenantId, id);
  }

  @Put('tasks/:id')
  @ApiOperation({ summary: 'Update task' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async updateTask(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return await this.taskService.update(tenantId, id, dto);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete task' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async deleteTask(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.taskService.remove(tenantId, id);
    return null;
  }

  // --- Notes ---
  @Get('notes')
  @ApiOperation({ summary: 'Get all notes' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getNotes(@TenantId() tenantId: string) {
    return await this.noteService.findAll(tenantId);
  }

  @Post('notes')
  @ApiOperation({ summary: 'Create note' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createNote(@TenantId() tenantId: string, @Body() dto: CreateNoteDto) {
    return await this.noteService.create(tenantId, dto);
  }

  @Delete('notes/:id')
  @ApiOperation({ summary: 'Delete note' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async deleteNote(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.noteService.remove(tenantId, id);
    return { success: true };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get CRM dashboard metrics' })
  async getDashboard(@TenantId() tenantId: string) {
    const summary = await this.analyticsService.getSummary(tenantId);
    return {
      contactsCount: summary.totalContacts,
      dealsValue: summary.totalRevenue,
      activeCampaigns: summary.totalDeals,
      totalLeads: summary.totalLeads,
      winRate: summary.winRate,
    };
  }

  // --- Products ---
  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getProducts(@TenantId() tenantId: string, @Query() query: CrmListQueryDto) {
    if (wantsPagination(query) || query.search || query.status) {
      return this.productService.findPaginated(tenantId, {
        ...query,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      });
    }
    return await this.productService.findAll(tenantId);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createProduct(@TenantId() tenantId: string, @Body() dto: CreateProductDto) {
    return await this.productService.create(tenantId, dto);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product detail' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getProduct(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.productService.findOne(tenantId, id);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update product' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateProduct(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return await this.productService.update(tenantId, id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete product' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteProduct(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.productService.remove(tenantId, id);
    return { success: true };
  }

  // --- Quotes ---
  @Get('quotes')
  @ApiOperation({ summary: 'Get all quotes' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getQuotes(@TenantId() tenantId: string, @Query() query: CrmListQueryDto) {
    if (wantsPagination(query) || query.search || query.status) {
      return this.quoteService.findPaginated(tenantId, {
        ...query,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      });
    }
    return await this.quoteService.findAll(tenantId);
  }

  @Post('quotes')
  @ApiOperation({ summary: 'Create quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createQuote(@TenantId() tenantId: string, @Body() dto: CreateQuoteDto) {
    return await this.quoteService.create(tenantId, dto);
  }

  @Get('quotes/:id')
  @ApiOperation({ summary: 'Get quote detail' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getQuote(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.quoteService.findOne(tenantId, id);
  }

  @Put('quotes/:id')
  @ApiOperation({ summary: 'Update quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateQuote(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateQuoteDto,
  ) {
    return await this.quoteService.update(tenantId, id, dto);
  }

  @Delete('quotes/:id')
  @ApiOperation({ summary: 'Delete quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteQuote(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.quoteService.remove(tenantId, id);
    return { success: true };
  }

  @Post('quotes/:id/send')
  @ApiOperation({ summary: 'Send quote by email' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async sendQuote(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: SendQuoteDto,
  ) {
    return await this.quoteLifecycleService.send(tenantId, id, dto);
  }

  @Post('quotes/:id/accept')
  @ApiOperation({ summary: 'Accept quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async acceptQuote(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.quoteLifecycleService.accept(tenantId, id);
  }

  @Post('quotes/:id/decline')
  @ApiOperation({ summary: 'Decline quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async declineQuote(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.quoteLifecycleService.decline(tenantId, id);
  }

  @Get('quotes/:id/pdf')
  @ApiOperation({ summary: 'Download quote PDF' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async downloadQuotePdf(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const quote = await this.quoteLifecycleService.findOne(tenantId, id);
    this.quoteLifecycleService.streamPdf(quote, res);
  }

  // --- Leads ---
  @Get('leads')
  @ApiOperation({ summary: 'Get all leads' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getLeads(@TenantId() tenantId: string, @Query() query: CrmListQueryDto) {
    if (wantsPagination(query) || query.search || query.status) {
      return this.leadService.findPaginated(tenantId, {
        ...query,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      });
    }
    return await this.leadService.findAll(tenantId);
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create lead' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createLead(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() dto: CreateLeadDto,
  ) {
    return await this.leadService.create(tenantId, dto, actor.userId);
  }

  @Post('leads/bulk')
  @ApiOperation({ summary: 'Bulk upload leads' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async bulkLeads(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() body: BulkCreateLeadsDto,
  ) {
    return await this.leadService.bulkCreate(tenantId, body.leads, actor.userId);
  }

  @Post('leads/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a CSV file of leads' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async uploadLeads(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const csvContent = file.buffer.toString('utf-8');
    const leads = await this.csvService.parseLeads(csvContent);
    return await this.leadService.bulkCreate(tenantId, leads, actor.userId);
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get lead detail' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getLead(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.leadService.findOne(tenantId, id);
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update lead' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateLead(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return await this.leadService.update(tenantId, id, dto, actor.userId);
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Delete lead' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteLead(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
  ) {
    await this.leadService.remove(tenantId, id, actor.userId);
    return null;
  }

  @Post('leads/:id/convert')
  @ApiOperation({ summary: 'Convert lead to contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async convertLead(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
    @Body() body: ConvertLeadDto,
  ) {
    const result = await this.leadConversionService.convertLead(id, {
      tenantId,
      createCompany: body.createCompany ?? false,
      createDeal: body.createDeal ?? false,
      dealName: body.dealName,
      pipelineId: body.pipelineId,
      actorId: actor.userId,
    });
    return {
      contactId: result.contact.id,
      contact: result.contact,
      companyId: result.companyId ?? null,
    };
  }

  // --- Campaigns ---
  @Get('campaigns')
  @ApiOperation({ summary: 'Get all campaigns' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCampaigns(@TenantId() tenantId: string) {
    return await this.campaignCrmService.findAll(tenantId);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create campaign' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createCampaign(@TenantId() tenantId: string, @Body() dto: CreateCampaignDto) {
    return await this.campaignCrmService.create(tenantId, dto);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get campaign detail' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.campaignCrmService.findOne(tenantId, id);
  }

  @Patch('campaigns/:id')
  @ApiOperation({ summary: 'Update campaign' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateCampaign(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return await this.campaignCrmService.update(tenantId, id, dto);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete campaign' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.campaignCrmService.remove(tenantId, id);
    return null;
  }

  // --- Analytics ---
  @Get('analytics/summary')
  @ApiOperation({ summary: 'Get CRM summary analytics' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getSummary(@TenantId() tenantId: string) {
    return await this.analyticsService.getSummary(tenantId);
  }

  @Get('analytics/pipeline')
  @ApiOperation({ summary: 'Get deal pipeline analytics' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getPipelineAnalytics(@TenantId() tenantId: string) {
    return await this.analyticsService.getPipelineData(tenantId);
  }

  @Get('analytics/leads')
  @ApiOperation({ summary: 'Get lead funnel analytics' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getLeadAnalytics(@TenantId() tenantId: string) {
    return await this.analyticsService.getLeadFunnels(tenantId);
  }

  // --- Emails ---
  @Get('emails')
  @ApiOperation({ summary: 'Get CRM email inbox' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getEmails(@TenantId() tenantId: string) {
    return await this.emailService.findAll(tenantId);
  }

  @Get('emails/:id')
  @ApiOperation({ summary: 'Get email message details' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getEmail(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.emailService.findOne(tenantId, id);
    await this.emailService.markAsRead(tenantId, id);
    return data;
  }

  @Post('emails/send')
  @ApiOperation({ summary: 'Send email to lead/contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async sendEmail(@TenantId() tenantId: string, @Body() body: SendCrmEmailDto) {
    return await this.emailService.sendEmail(tenantId, body);
  }

  @Delete('emails/:id')
  @ApiOperation({ summary: 'Delete email message' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async removeEmail(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.emailService.remove(tenantId, id);
    return null;
  }

  // --- Bulk Operations ---
  @Patch('bulk/status')
  @ApiOperation({ summary: 'Bulk update status for leads/contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async bulkUpdateStatus(@TenantId() tenantId: string, @Body() body: BulkStatusDto) {
    await this.bulkService.bulkUpdateStatus(tenantId, body.entityType, body.ids, body.status);
    return null;
  }

  @Post('bulk/delete')
  @ApiOperation({ summary: 'Bulk delete leads/contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async bulkDelete(@TenantId() tenantId: string, @Body() body: BulkDeleteDto) {
    await this.bulkService.bulkDelete(tenantId, body.entityType, body.ids);
    return null;
  }

  // --- Import/Export ---
  @Post('import')
  @ApiOperation({ summary: 'Bulk import leads/contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async importData(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() body: ImportCrmDataDto,
  ) {
    if (body.entityType === 'lead') {
      await this.leadService.bulkCreate(
        tenantId,
        body.data as unknown as CreateLeadDto[],
        actor.userId,
      );
    } else {
      await Promise.all(
        body.data.map((item) =>
          this.contactService.create(tenantId, item as unknown as CreateContactDto, actor.userId),
        ),
      );
    }
    return null;
  }

  @Get('export/:entityType')
  @ApiOperation({ summary: 'Export leads/contacts to CSV' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async exportData(
    @TenantId() tenantId: string,
    @Param('entityType') entityType: 'lead' | 'contact',
  ) {
    const service =
      entityType === 'lead' ? (this.leadService as any) : (this.contactService as any);
    const data = await service.findAll(tenantId);
    return this.csvService.generateCsv(data);
  }

  // --- Pipelines ---
  @Get('pipelines')
  @ApiOperation({ summary: 'Get all pipelines' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getPipelines(@TenantId() tenantId: string) {
    return await this.pipelineService.findAll(tenantId);
  }

  @Get('pipelines/default')
  @ApiOperation({ summary: 'Get default pipeline' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDefaultPipeline(@TenantId() tenantId: string) {
    return await this.pipelineService.findDefault(tenantId);
  }

  @Post('pipelines')
  @ApiOperation({ summary: 'Create pipeline' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createPipeline(@TenantId() tenantId: string, @Body() dto: CreatePipelineDto) {
    return await this.pipelineService.create(tenantId, dto as never);
  }

  @Get('pipelines/:id')
  @ApiOperation({ summary: 'Get pipeline by id' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getPipeline(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.pipelineService.findOne(tenantId, id);
  }

  @Put('pipelines/:id')
  @ApiOperation({ summary: 'Update pipeline' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updatePipeline(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return await this.pipelineService.update(tenantId, id, dto as never);
  }

  @Post('pipelines/:id/stages')
  @ApiOperation({ summary: 'Create pipeline stage' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createStage(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: CreatePipelineStageDto,
  ) {
    return await this.pipelineService.createStage(tenantId, id, dto);
  }

  // --- Tags ---
  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getTags(@TenantId() tenantId: string) {
    return await this.tagService.findAll(tenantId);
  }

  @Post('tags')
  @ApiOperation({ summary: 'Create tag' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createTag(@TenantId() tenantId: string, @Body() dto: CreateTagDto) {
    return await this.tagService.create(tenantId, dto);
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Delete tag' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteTag(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.tagService.remove(tenantId, id);
    return { success: true };
  }

  // --- Segments ---
  @Get('segments')
  @ApiOperation({ summary: 'Get all segments' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getSegments(@TenantId() tenantId: string) {
    return await this.segmentService.findAll(tenantId);
  }

  @Post('segments')
  @ApiOperation({ summary: 'Create segment' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createSegment(@TenantId() tenantId: string, @Body() dto: CreateSegmentDto) {
    return await this.segmentService.create(tenantId, dto);
  }

  @Delete('segments/:id')
  @ApiOperation({ summary: 'Delete segment' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteSegment(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.segmentService.remove(tenantId, id);
    return { success: true };
  }

  // --- Custom Fields ---
  @Get('custom-fields')
  @ApiOperation({ summary: 'Get all custom fields' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCustomFields(@TenantId() tenantId: string) {
    return await this.customFieldService.findAll(tenantId);
  }

  @Post('custom-fields')
  @ApiOperation({ summary: 'Create custom field' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createCustomField(@TenantId() tenantId: string, @Body() dto: CreateCustomFieldDto) {
    return await this.customFieldService.create(tenantId, dto);
  }

  @Get('custom-fields/:id')
  @ApiOperation({ summary: 'Get custom field detail' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCustomField(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.customFieldService.findOne(tenantId, id);
  }

  @Put('custom-fields/:id')
  @ApiOperation({ summary: 'Update custom field' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateCustomField(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomFieldDto,
  ) {
    return await this.customFieldService.update(tenantId, id, dto);
  }

  @Delete('custom-fields/:id')
  @ApiOperation({ summary: 'Delete custom field' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteCustomField(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.customFieldService.remove(tenantId, id);
    return { success: true };
  }

  // --- Forecast ---
  @Get('forecast')
  @ApiOperation({ summary: 'Weighted pipeline forecast' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getForecast(@TenantId() tenantId: string, @Query('pipelineId') pipelineId?: string) {
    return await this.forecastService.getForecast(tenantId, pipelineId);
  }

  @Get('forecast/by-stage')
  @ApiOperation({ summary: 'Forecast grouped by pipeline stage' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getForecastByStage(@TenantId() tenantId: string, @Query('pipelineId') pipelineId?: string) {
    return await this.forecastService.getByStage(tenantId, pipelineId);
  }

  @Get('forecast/by-owner')
  @ApiOperation({ summary: 'Forecast grouped by deal owner' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getForecastByOwner(@TenantId() tenantId: string, @Query('pipelineId') pipelineId?: string) {
    return await this.forecastService.getByOwner(tenantId, pipelineId);
  }

  @Get('forecast/historical')
  @ApiOperation({ summary: 'Historical forecast accuracy' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getForecastHistorical(@TenantId() tenantId: string) {
    return await this.forecastService.getHistorical(tenantId);
  }
}
