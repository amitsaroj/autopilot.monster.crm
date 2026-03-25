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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { AgentService } from './agent.service';
import { CampaignService } from './campaign.service';
import { CsvService } from './csv.service';
import { FlowService } from './flow.service';
import { LeadService } from './lead.service';
import { ContactService } from './contact.service';
import { CompanyService } from './company.service';
import { DealService } from './deal.service';
import { PipelineService } from './pipeline.service';
import { ActivityService, TaskCrmService, NoteService, ProductService, QuoteService, CampaignCrmService, AnalyticsCrmService, EmailCrmService, BulkCrmService } from './crm-support.service';
import { CreateContactDto, CreateCompanyDto, CreateDealDto } from './dto/crm.dto';
import { TenantId, Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('CRM & AI Agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
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
    const data = await this.contactService.findAll(tenantId);
    return {
      status: 200,
      message: 'Contacts retrieved',
      error: false,
      data,
    };
  }

  @Post('contacts')
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
  async updateContact(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CreateContactDto>) {
    const data = await this.contactService.update(tenantId, id, dto);
    return {
      status: 200,
      message: 'Contact updated',
      error: false,
      data,
    };
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Delete contact' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteContact(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.contactService.remove(tenantId, id);
    return {
      status: 200,
      message: 'Contact deleted',
      error: false,
      data: null,
    };
  }

  // --- Companies ---
  @Get('companies')
  @ApiOperation({ summary: 'Get all companies' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getCompanies(@TenantId() tenantId: string) {
    const data = await this.companyService.findAll(tenantId);
    return {
      status: 200,
      message: 'Companies retrieved',
      error: false,
      data,
    };
  }

  @Post('companies')
  @ApiOperation({ summary: 'Create company' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createCompany(@TenantId() tenantId: string, @Body() dto: CreateCompanyDto) {
    const data = await this.companyService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Company created successfully',
      error: false,
      data,
    };
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
  async updateCompany(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CreateCompanyDto>) {
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
    return {
      status: 200,
      message: 'Company deleted',
      error: false,
      data: null,
    };
  }

  // --- Deals ---

  @Get('deals/board')
  @ApiOperation({ summary: 'Get deal board data (Kanban)' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDealBoard(@TenantId() tenantId: string, @Param('pipelineId') pipelineId: string) {
    const data = await this.dealService.getBoard(tenantId, pipelineId);
    return {
      status: 200,
      message: 'Deal board data retrieved',
      error: false,
      data,
    };
  }

  @Get('deals')
  @ApiOperation({ summary: 'Get all deals' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDeals(@TenantId() tenantId: string) {
    const data = await this.dealService.findAll(tenantId);
    return {
      status: 200,
      message: 'Deals retrieved',
      error: false,
      data,
    };
  }

  @Post('deals')
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
    const data = await this.dealService.findOne(tenantId, id);
    return {
      status: 200,
      message: 'Deal retrieved',
      error: false,
      data,
    };
  }

  @Put('deals/:id')
  @ApiOperation({ summary: 'Update deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async updateDeal(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CreateDealDto>) {
    const data = await this.dealService.update(tenantId, id, dto);
    return {
      status: 200,
      message: 'Deal updated',
      error: false,
      data,
    };
  }

  @Delete('deals/:id')
  @ApiOperation({ summary: 'Delete deal' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteDeal(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.dealService.remove(tenantId, id);
    return {
      status: 200,
      message: 'Deal deleted',
      error: false,
      data: null,
    };
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
    const data = await this.activityService.findAll(tenantId);
    return {
      status: 200,
      message: 'Activities retrieved',
      error: false,
      data,
    };
  }

  @Post('activities')
  @ApiOperation({ summary: 'Log activity' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createActivity(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.activityService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Activity logged successfully',
      error: false,
      data,
    };
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

  @Get('dashboard')
  @ApiOperation({ summary: 'Get CRM dashboard metrics' })
  async getDashboard(@TenantId() _tenantId: string) {
    return {
      status: 200,
      message: 'Dashboard metrics retrieved',
      error: false,
      data: {
        contactsCount: 0,
        dealsValue: 0,
        activeCampaigns: 0,
      },
    };
  }

  // --- Products ---
  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getProducts(@TenantId() tenantId: string) {
    const data = await this.productService.findAll(tenantId);
    return {
      status: 200,
      message: 'Products retrieved',
      error: false,
      data,
    };
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createProduct(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.productService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Product created successfully',
      error: false,
      data,
    };
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product detail' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getProduct(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.productService.findOne(tenantId, id);
    return {
      status: 200,
      message: 'Product details retrieved',
      error: false,
      data,
    };
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update product' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateProduct(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    const data = await this.productService.update(tenantId, id, dto);
    return {
      status: 200,
      message: 'Product updated',
      error: false,
      data,
    };
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete product' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteProduct(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.productService.remove(tenantId, id);
    return {
      status: 200,
      message: 'Product deleted',
      error: false,
      data: null,
    };
  }

  // --- Quotes ---
  @Get('quotes')
  @ApiOperation({ summary: 'Get all quotes' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getQuotes(@TenantId() tenantId: string) {
    const data = await this.quoteService.findAll(tenantId);
    return {
      status: 200,
      message: 'Quotes retrieved',
      error: false,
      data,
    };
  }

  @Post('quotes')
  @ApiOperation({ summary: 'Create quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createQuote(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.quoteService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Quote created successfully',
      error: false,
      data,
    };
  }

  @Get('quotes/:id')
  @ApiOperation({ summary: 'Get quote detail' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getQuote(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.quoteService.findOne(tenantId, id);
    return {
      status: 200,
      message: 'Quote details retrieved',
      error: false,
      data,
    };
  }

  @Put('quotes/:id')
  @ApiOperation({ summary: 'Update quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateQuote(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    const data = await this.quoteService.update(tenantId, id, dto);
    return {
      status: 200,
      message: 'Quote updated',
      error: false,
      data,
    };
  }

  @Delete('quotes/:id')
  @ApiOperation({ summary: 'Delete quote' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteQuote(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.quoteService.remove(tenantId, id);
    return {
      status: 200,
      message: 'Quote deleted',
      error: false,
      data: null,
    };
  }

  // --- Leads ---
  @Get('leads')
  @ApiOperation({ summary: 'Get all leads' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getLeads(@TenantId() tenantId: string) {
    const data = await this.leadService.findAll(tenantId);
    return {
      status: 200,
      message: 'Leads retrieved',
      error: false,
      data,
    };
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create lead' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createLead(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.leadService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Lead created successfully',
      error: false,
      data,
    };
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
  @ApiOperation({ summary: 'Convert lead' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async convertLead(@TenantId() _tenantId: string, @Param('id') _id: string) {
    return {
      status: 200,
      message: 'Lead conversion started',
      error: false,
      data: { success: true },
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
    const service = body.entityType === 'lead' ? (this.leadService as any) : (this.contactService as any);
    await Promise.all(body.data.map(item => service.create(tenantId, item)));
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
    const service = entityType === 'lead' ? (this.leadService as any) : (this.contactService as any);
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
    const data = await this.pipelineService.findAll(tenantId);
    return {
      status: 200,
      message: 'Pipelines retrieved',
      error: false,
      data,
    };
  }

  @Get('pipelines/default')
  @ApiOperation({ summary: 'Get default pipeline' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getDefaultPipeline(@TenantId() tenantId: string) {
    const data = await this.pipelineService.findDefault(tenantId);
    return {
      status: 200,
      message: 'Default pipeline retrieved',
      error: false,
      data,
    };
  }

  @Post('pipelines')
  @ApiOperation({ summary: 'Create pipeline' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createPipeline(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.pipelineService.create(tenantId, dto);
    return {
      status: 201,
      message: 'Pipeline created',
      error: false,
      data,
    };
  }

  @Post('pipelines/:id/stages')
  @ApiOperation({ summary: 'Create pipeline stage' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createStage(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    const data = await this.pipelineService.createStage(tenantId, id, dto);
    return {
      status: 201,
      message: 'Pipeline stage created',
      error: false,
      data,
    };
  }
}
