import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
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
import { CreateContactDto, CreateCompanyDto, CreateDealDto } from './dto/crm.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
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

  // --- Leads ---
  @Get('leads')
  @ApiOperation({ summary: 'Get all leads from CRM' })
  getLeads(@TenantId() tenantId: string) {
    return this.leadService.findAll(tenantId);
  }

  @Post('leads/bulk')
  @ApiOperation({ summary: 'Bulk upload leads as JSON' })
  bulkCreateLeads(@TenantId() tenantId: string, @Body() leads: any[]) {
    return this.leadService.bulkCreate(tenantId, leads);
  }

  @Post('leads/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a CSV file of leads' })
  async uploadLeads(@TenantId() tenantId: string, @UploadedFile() file: Express.Multer.File) {
    const csvContent = file.buffer.toString('utf-8');
    const leads = await this.csvService.parseLeads(csvContent);
    return this.leadService.bulkCreate(tenantId, leads);
  }

  // --- Bulk Campaigns ---
  // --- Contacts ---
  @Get('contacts')
  @ApiOperation({ summary: 'Get all contacts' })
  getContacts(@TenantId() tenantId: string) {
    return this.contactService.findAll(tenantId);
  }

  @Post('contacts')
  @ApiOperation({ summary: 'Create contact' })
  createContact(@TenantId() tenantId: string, @Body() dto: CreateContactDto) {
    return this.contactService.create(tenantId, dto);
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: 'Get contact by ID' })
  getContact(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.contactService.findOne(tenantId, id);
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Update contact' })
  updateContact(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CreateContactDto>) {
    return this.contactService.update(tenantId, id, dto);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Delete contact' })
  deleteContact(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.contactService.remove(tenantId, id);
  }

  // --- Companies ---
  @Get('companies')
  @ApiOperation({ summary: 'Get all companies' })
  getCompanies(@TenantId() tenantId: string) {
    return this.companyService.findAll(tenantId);
  }

  @Post('companies')
  @ApiOperation({ summary: 'Create company' })
  createCompany(@TenantId() tenantId: string, @Body() dto: CreateCompanyDto) {
    return this.companyService.create(tenantId, dto);
  }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company by ID' })
  getCompany(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.companyService.findOne(tenantId, id);
  }

  @Put('companies/:id')
  @ApiOperation({ summary: 'Update company' })
  updateCompany(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CreateCompanyDto>) {
    return this.companyService.update(tenantId, id, dto);
  }

  @Delete('companies/:id')
  @ApiOperation({ summary: 'Delete company' })
  deleteCompany(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.companyService.remove(tenantId, id);
  }

  // --- Deals ---
  @Get('deals')
  @ApiOperation({ summary: 'Get all deals' })
  getDeals(@TenantId() tenantId: string) {
    return this.dealService.findAll(tenantId);
  }

  @Post('deals')
  @ApiOperation({ summary: 'Create deal' })
  createDeal(@TenantId() tenantId: string, @Body() dto: CreateDealDto) {
    return this.dealService.create(tenantId, dto);
  }

  @Get('deals/:id')
  @ApiOperation({ summary: 'Get deal by ID' })
  getDeal(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dealService.findOne(tenantId, id);
  }

  @Put('deals/:id')
  @ApiOperation({ summary: 'Update deal' })
  updateDeal(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CreateDealDto>) {
    return this.dealService.update(tenantId, id, dto);
  }

  @Delete('deals/:id')
  @ApiOperation({ summary: 'Delete deal' })
  deleteDeal(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dealService.remove(tenantId, id);
  }

  @Post('campaigns/start')
  @ApiOperation({ summary: 'Start a bulk AI calling campaign' })
  startCampaign(
    @TenantId() tenantId: string,
    @Body() body: { agentId: string; leadIds: string[] },
  ) {
    return this.campaignService.startBulkCampaign(tenantId, body.agentId, body.leadIds);
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get recent CRM activities' })
  getActivities(@TenantId() tenantId: string) {
    console.log(`Fetching activities for tenant ${tenantId}`);
    return [];
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get CRM dashboard metrics' })
  getDashboard(@TenantId() tenantId: string) {
    console.log(`Fetching CRM dashboard for tenant ${tenantId}`);
    return {
        contactsCount: 0,
        dealsValue: 0,
        activeCampaigns: 0
    };
  }
}
