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
import { CreateContactDto, CreateCompanyDto, CreateDealDto } from './dto/crm.dto';
import { MoveDealStageDto, MarkDealLostDto, CreateContactNoteDto } from './dto/deal-lifecycle.dto';
import { DealProductService } from './deal-product.service';
import { AddDealProductDto } from './dto/deal-product.dto';
import { SendQuoteDto } from './dto/quote-lifecycle.dto';
import { LeadConversionService } from './services/lead-conversion.service';
import { TenantId, Roles, ResourcePermissions, PlanFeature, Limit } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

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

  @Post('agents')
  @ApiOperation({ summary: 'Create a new AI agent' })
  createAgent(@TenantId() tenantId: string, @Body() data: any) {
    return this.agentService.create(tenantId, data);
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
  async getContacts(@TenantId() tenantId: string) {
    return await this.contactService.findAll(tenantId);
  }

  @Post('contacts')
  @Limit('contacts_limit')
  @ApiOperation({ summary: 'Create contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createContact(@TenantId() tenantId: string, @Body() dto: CreateContactDto) {
    const data = await this.contactService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Contact created successfully',
      error: false,
      data,
    };
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContact(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.contactService.findOne(tenantId, id);
    return {
      status: 200,
      message: 'Contact retrieved',
      error: false,
      data,
    };
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Update contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async updateContact(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateContactDto>,
  ) {
    return await this.contactService.update(tenantId, id, dto);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Delete contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteContact(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.contactService.remove(tenantId, id);
    return { success: true };
  }

  @Get('contacts/:id/activities')
  @ApiOperation({ summary: 'Get contact activity feed' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactActivities(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.contactService.getActivities(tenantId, id);
    return { status: 200, message: 'Contact activities retrieved', error: false, data };
  }

  @Get('contacts/:id/deals')
  @ApiOperation({ summary: 'Get deals linked to contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactDeals(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.contactService.getDeals(tenantId, id);
    return { status: 200, message: 'Contact deals retrieved', error: false, data };
  }

  @Get('contacts/:id/notes')
  @ApiOperation({ summary: 'Get notes for contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactNotes(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.contactService.getNotes(tenantId, id);
    return { status: 200, message: 'Contact notes retrieved', error: false, data };
  }

  @Post('contacts/:id/notes')
  @ApiOperation({ summary: 'Create note for contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createContactNote(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: CreateContactNoteDto,
  ) {
    const data = await this.contactService.createNote(tenantId, id, dto);
    return { status: 201, message: 'Note created', error: false, data };
  }

  @Get('contacts/:id/calls')
  @ApiOperation({ summary: 'Get call history for contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactCalls(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.contactService.getCalls(tenantId, id);
    return { status: 200, message: 'Contact calls retrieved', error: false, data };
  }

  @Get('contacts/:id/emails')
  @ApiOperation({ summary: 'Get email history for contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactEmails(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.contactService.getEmails(tenantId, id);
    return { status: 200, message: 'Contact emails retrieved', error: false, data };
  }

  @Get('contacts/:id/whatsapp')
  @ApiOperation({ summary: 'Get WhatsApp history for contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getContactWhatsapp(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.contactService.getWhatsappMessages(tenantId, id);
    return { status: 200, message: 'Contact WhatsApp messages retrieved', error: false, data };
  }

  @Post('contacts/merge')
  @ApiOperation({ summary: 'Merge two contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async mergeContacts(
    @TenantId() tenantId: string,
    @Body() body: { primaryId: string; secondaryId: string },
  ) {
    const data = await this.contactService.mergeContacts(tenantId, body.primaryId, body.secondaryId);
    return { status: 200, message: 'Contacts merged', error: false, data };
  }

  // --- Companies ---
  @Get('companies')
  @ApiOperation({ summary: 'Get all companies' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompanies(@TenantId() tenantId: string) {
    return await this.companyService.findAll(tenantId);
  }

  @Post('companies')
  @ApiOperation({ summary: 'Create company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createCompany(@TenantId() tenantId: string, @Body() dto: CreateCompanyDto) {
    return await this.companyService.create(tenantId, dto);
  }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company by ID' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompany(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.companyService.findOne(tenantId, id);
    return {
      status: 200,
      message: 'Company retrieved',
      error: false,
      data,
    };
  }

  @Put('companies/:id')
  @ApiOperation({ summary: 'Update company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async updateCompany(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateCompanyDto>,
  ) {
    const data = await this.companyService.update(tenantId, id, dto);
    return {
      status: 200,
      message: 'Company updated',
      error: false,
      data,
    };
  }

  @Delete('companies/:id')
  @ApiOperation({ summary: 'Delete company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteCompany(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.companyService.delete(tenantId, id);
    return { success: true };
  }

  @Get('companies/:id/contacts')
  @ApiOperation({ summary: 'Get contacts at company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompanyContacts(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.companyService.getContacts(tenantId, id);
    return { status: 200, message: 'Company contacts retrieved', error: false, data };
  }

  @Get('companies/:id/deals')
  @ApiOperation({ summary: 'Get deals for company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompanyDeals(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.companyService.getDeals(tenantId, id);
    return { status: 200, message: 'Company deals retrieved', error: false, data };
  }

  @Get('companies/:id/activities')
  @ApiOperation({ summary: 'Get company activity timeline' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompanyActivities(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.companyService.getActivities(tenantId, id);
    return { status: 200, message: 'Company activities retrieved', error: false, data };
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
  async getDeals(@TenantId() tenantId: string) {
    return await this.dealService.findAll(tenantId);
  }

  @Post('deals')
  @Limit('deals_limit')
  @ApiOperation({ summary: 'Create deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createDeal(@TenantId() tenantId: string, @Body() dto: CreateDealDto) {
    const data = await this.dealService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Deal created successfully',
      error: false,
      data,
    };
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
    @Param('id') id: string,
    @Body() dto: Partial<CreateDealDto>,
  ) {
    return await this.dealService.update(tenantId, id, dto);
  }

  @Delete('deals/:id')
  @ApiOperation({ summary: 'Delete deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteDeal(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.dealService.remove(tenantId, id);
    return { success: true };
  }

  @Patch('deals/:id/stage')
  @ApiOperation({ summary: 'Move deal to another pipeline stage' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async moveDealStage(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: MoveDealStageDto,
  ) {
    const data = await this.dealService.moveStage(tenantId, id, dto.stageId, undefined, dto.reason);
    return { status: 200, message: 'Deal stage updated', error: false, data };
  }

  @Patch('deals/:id/won')
  @ApiOperation({ summary: 'Mark deal as won' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async markDealWon(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.dealService.markWon(tenantId, id);
    return { status: 200, message: 'Deal marked as won', error: false, data };
  }

  @Patch('deals/:id/lost')
  @ApiOperation({ summary: 'Mark deal as lost' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async markDealLost(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: MarkDealLostDto,
  ) {
    const data = await this.dealService.markLost(tenantId, id, dto.lostReason);
    return { status: 200, message: 'Deal marked as lost', error: false, data };
  }

  @Get('deals/:id/products')
  @ApiOperation({ summary: 'Get products linked to deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDealProducts(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.dealProductService.listProducts(tenantId, id);
    return { status: 200, message: 'Deal products retrieved', error: false, data };
  }

  @Get('deals/:id/activities')
  @ApiOperation({ summary: 'Get activities linked to deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDealActivities(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.activityService.findByDeal(tenantId, id);
    return { status: 200, message: 'Deal activities retrieved', error: false, data };
  }

  @Post('deals/:id/products')
  @ApiOperation({ summary: 'Add product to deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async addDealProduct(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AddDealProductDto,
  ) {
    const data = await this.dealProductService.addProduct(tenantId, id, dto);
    return { status: 201, message: 'Product added to deal', error: false, data };
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
    return { status: 200, message: 'Product removed from deal', error: false, data: null };
  }

  @Post('campaigns/start')
  @ApiOperation({ summary: 'Start a bulk AI calling campaign' })
  startCampaign(
    @TenantId() tenantId: string,
    @Body() body: { agentId: string; leadIds: string[] },
  ) {
    return this.campaignService.startBulkCampaign(tenantId, body.agentId, body.leadIds);
  }

  // --- Activities ---
  @Get('activities')
  @ApiOperation({ summary: 'Get recent CRM activities' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getActivities(@TenantId() tenantId: string) {
    return await this.activityService.findAll(tenantId);
  }

  @Post('activities')
  @ApiOperation({ summary: 'Log activity' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createActivity(@TenantId() tenantId: string, @Body() dto: any) {
    return await this.activityService.create(tenantId, dto);
  }

  // --- Tasks ---
  @Get('tasks')
  @ApiOperation({ summary: 'Get all CRM tasks' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getTasks(@TenantId() tenantId: string) {
    const data = await this.taskService.findAll(tenantId);
    return {
      status: 200,
      message: 'Tasks retrieved',
      error: false,
      data,
    };
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create CRM task' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createTask(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.taskService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Task created successfully',
      error: false,
      data,
    };
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
  async updateTask(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return await this.taskService.update(tenantId, id, dto);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete task' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async deleteTask(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.taskService.remove(tenantId, id);
    return {
      status: 200,
      message: 'Task deleted',
      error: false,
      data: null,
    };
  }

  // --- Notes ---
  @Get('notes')
  @ApiOperation({ summary: 'Get all notes' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getNotes(@TenantId() tenantId: string) {
    const data = await this.noteService.findAll(tenantId);
    return {
      status: 200,
      message: 'Notes retrieved',
      error: false,
      data,
    };
  }

  @Post('notes')
  @ApiOperation({ summary: 'Create note' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createNote(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.noteService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Note created successfully',
      error: false,
      data,
    };
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
  async getProducts(@TenantId() tenantId: string) {
    return await this.productService.findAll(tenantId);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createProduct(@TenantId() tenantId: string, @Body() dto: any) {
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
  async updateProduct(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
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
  async getQuotes(@TenantId() tenantId: string) {
    return await this.quoteService.findAll(tenantId);
  }

  @Post('quotes')
  @ApiOperation({ summary: 'Create quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createQuote(@TenantId() tenantId: string, @Body() dto: any) {
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
  async updateQuote(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
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
    const data = await this.quoteLifecycleService.send(tenantId, id, dto);
    return { status: 200, message: 'Quote sent', error: false, data };
  }

  @Post('quotes/:id/accept')
  @ApiOperation({ summary: 'Accept quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async acceptQuote(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.quoteLifecycleService.accept(tenantId, id);
    return { status: 200, message: 'Quote accepted', error: false, data };
  }

  @Post('quotes/:id/decline')
  @ApiOperation({ summary: 'Decline quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async declineQuote(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.quoteLifecycleService.decline(tenantId, id);
    return { status: 200, message: 'Quote declined', error: false, data };
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
  async getLeads(@TenantId() tenantId: string) {
    return await this.leadService.findAll(tenantId);
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create lead' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createLead(@TenantId() tenantId: string, @Body() dto: any) {
    return await this.leadService.create(tenantId, dto);
  }

  @Post('leads/bulk')
  @ApiOperation({ summary: 'Bulk upload leads' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async bulkLeads(@TenantId() tenantId: string, @Body() leads: any[]) {
    const data = await this.leadService.bulkCreate(tenantId, leads);
    return {
      status: 201,
      message: 'Leads bulk created',
      error: false,
      data,
    };
  }

  @Post('leads/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a CSV file of leads' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async uploadLeads(@TenantId() tenantId: string, @UploadedFile() file: Express.Multer.File) {
    const csvContent = file.buffer.toString('utf-8');
    const leads = await this.csvService.parseLeads(csvContent);
    const data = await this.leadService.bulkCreate(tenantId, leads);
    return {
      status: 201,
      message: 'CSV leads uploaded',
      error: false,
      data,
    };
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get lead detail' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getLead(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.leadService.findOne(tenantId, id);
    return {
      status: 200,
      message: 'Lead details retrieved',
      error: false,
      data,
    };
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update lead' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateLead(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    const data = await this.leadService.update(tenantId, id, dto);
    return {
      status: 200,
      message: 'Lead updated',
      error: false,
      data,
    };
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Delete lead' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteLead(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.leadService.remove(tenantId, id);
    return {
      status: 200,
      message: 'Lead deleted',
      error: false,
      data: null,
    };
  }

  @Post('leads/:id/convert')
  @ApiOperation({ summary: 'Convert lead to contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async convertLead(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body()
    body: {
      createCompany?: boolean;
      createDeal?: boolean;
      dealName?: string;
      pipelineId?: string;
    },
  ) {
    const result = await this.leadConversionService.convertLead(id, {
      tenantId,
      createCompany: body.createCompany ?? false,
      createDeal: body.createDeal ?? false,
      dealName: body.dealName,
      pipelineId: body.pipelineId,
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
    const data = await this.campaignCrmService.findAll(tenantId);
    return {
      status: 200,
      message: 'Campaigns retrieved',
      error: false,
      data,
    };
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create campaign' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createCampaign(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.campaignCrmService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Campaign created successfully',
      error: false,
      data,
    };
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get campaign detail' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.campaignCrmService.findOne(tenantId, id);
    return {
      status: 200,
      message: 'Campaign details retrieved',
      error: false,
      data,
    };
  }

  @Patch('campaigns/:id')
  @ApiOperation({ summary: 'Update campaign' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateCampaign(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    const data = await this.campaignCrmService.update(tenantId, id, dto);
    return {
      status: 200,
      message: 'Campaign updated',
      error: false,
      data,
    };
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete campaign' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.campaignCrmService.remove(tenantId, id);
    return {
      status: 200,
      message: 'Campaign deleted',
      error: false,
      data: null,
    };
  }

  // --- Analytics ---
  @Get('analytics/summary')
  @ApiOperation({ summary: 'Get CRM summary analytics' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getSummary(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getSummary(tenantId);
    return {
      status: 200,
      message: 'Summary analytics retrieved',
      error: false,
      data,
    };
  }

  @Get('analytics/pipeline')
  @ApiOperation({ summary: 'Get deal pipeline analytics' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getPipelineAnalytics(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getPipelineData(tenantId);
    return {
      status: 200,
      message: 'Pipeline analytics retrieved',
      error: false,
      data,
    };
  }

  @Get('analytics/leads')
  @ApiOperation({ summary: 'Get lead funnel analytics' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getLeadAnalytics(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getLeadFunnels(tenantId);
    return {
      status: 200,
      message: 'Lead analytics retrieved',
      error: false,
      data,
    };
  }

  // --- Emails ---
  @Get('emails')
  @ApiOperation({ summary: 'Get CRM email inbox' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getEmails(@TenantId() tenantId: string) {
    const data = await this.emailService.findAll(tenantId);
    return {
      status: 200,
      message: 'Emails retrieved',
      error: false,
      data,
    };
  }

  @Get('emails/:id')
  @ApiOperation({ summary: 'Get email message details' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getEmail(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.emailService.findOne(tenantId, id);
    await this.emailService.markAsRead(tenantId, id);
    return {
      status: 200,
      message: 'Email retrieved',
      error: false,
      data,
    };
  }

  @Post('emails/send')
  @ApiOperation({ summary: 'Send email to lead/contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async sendEmail(@TenantId() tenantId: string, @Body() body: any) {
    const data = await this.emailService.sendEmail(tenantId, body);
    return {
      status: 200,
      message: 'Email sent',
      error: false,
      data,
    };
  }

  @Delete('emails/:id')
  @ApiOperation({ summary: 'Delete email message' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async removeEmail(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.emailService.remove(tenantId, id);
    return {
      status: 200,
      message: 'Email deleted',
      error: false,
      data: null,
    };
  }

  // --- Bulk Operations ---
  @Patch('bulk/status')
  @ApiOperation({ summary: 'Bulk update status for leads/contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async bulkUpdateStatus(
    @TenantId() tenantId: string,
    @Body() body: { ids: string[]; status: string; entityType: 'lead' | 'contact' },
  ) {
    await this.bulkService.bulkUpdateStatus(tenantId, body.entityType, body.ids, body.status);
    return {
      status: 200,
      message: `Bulk status updated for ${body.ids.length} ${body.entityType}s`,
      error: false,
      data: null,
    };
  }

  @Post('bulk/delete')
  @ApiOperation({ summary: 'Bulk delete leads/contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async bulkDelete(
    @TenantId() tenantId: string,
    @Body() body: { ids: string[]; entityType: 'lead' | 'contact' },
  ) {
    await this.bulkService.bulkDelete(tenantId, body.entityType, body.ids);
    return {
      status: 200,
      message: `Bulk deleted ${body.ids.length} ${body.entityType}s`,
      error: false,
      data: null,
    };
  }

  // --- Import/Export ---
  @Post('import')
  @ApiOperation({ summary: 'Bulk import leads/contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async importData(
    @TenantId() tenantId: string,
    @Body() body: { entityType: 'lead' | 'contact'; data: any[] },
  ) {
    const service =
      body.entityType === 'lead' ? (this.leadService as any) : (this.contactService as any);
    await Promise.all(body.data.map((item) => service.create(tenantId, item)));
    return {
      status: 200,
      message: `Successfully imported ${body.data.length} ${body.entityType}s`,
      error: false,
      data: null,
    };
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
    const csv = this.csvService.generateCsv(data);
    return {
      status: 200,
      message: 'CSV Export generated',
      error: false,
      data: csv,
    };
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
  async createPipeline(@TenantId() tenantId: string, @Body() dto: any) {
    return await this.pipelineService.create(tenantId, dto);
  }

  @Get('pipelines/:id')
  @ApiOperation({ summary: 'Get pipeline by id' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getPipeline(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.pipelineService.findOne(tenantId, id);
    return { status: 200, message: 'Pipeline retrieved', error: false, data };
  }

  @Put('pipelines/:id')
  @ApiOperation({ summary: 'Update pipeline' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updatePipeline(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    const data = await this.pipelineService.update(tenantId, id, dto);
    return { status: 200, message: 'Pipeline updated', error: false, data };
  }

  @Post('pipelines/:id/stages')
  @ApiOperation({ summary: 'Create pipeline stage' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createStage(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
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
  async createTag(@TenantId() tenantId: string, @Body() dto: any) {
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
  async createSegment(@TenantId() tenantId: string, @Body() dto: any) {
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
  async createCustomField(@TenantId() tenantId: string, @Body() dto: any) {
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
  async updateCustomField(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
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
    const data = await this.forecastService.getForecast(tenantId, pipelineId);
    return { status: 200, message: 'Forecast retrieved', error: false, data };
  }

  @Get('forecast/by-stage')
  @ApiOperation({ summary: 'Forecast grouped by pipeline stage' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getForecastByStage(@TenantId() tenantId: string, @Query('pipelineId') pipelineId?: string) {
    const data = await this.forecastService.getByStage(tenantId, pipelineId);
    return { status: 200, message: 'Forecast by stage retrieved', error: false, data };
  }

  @Get('forecast/by-owner')
  @ApiOperation({ summary: 'Forecast grouped by deal owner' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getForecastByOwner(@TenantId() tenantId: string, @Query('pipelineId') pipelineId?: string) {
    const data = await this.forecastService.getByOwner(tenantId, pipelineId);
    return { status: 200, message: 'Forecast by owner retrieved', error: false, data };
  }

  @Get('forecast/historical')
  @ApiOperation({ summary: 'Historical forecast accuracy' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getForecastHistorical(@TenantId() tenantId: string) {
    const data = await this.forecastService.getHistorical(tenantId);
    return { status: 200, message: 'Historical forecast retrieved', error: false, data };
  }
}
