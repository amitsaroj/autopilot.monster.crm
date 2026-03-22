import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { FlowService } from './flow.service';
import { LeadService } from './lead.service';
import { CsvService } from './csv.service';
import { CampaignService } from './campaign.service';
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
  async uploadLeads(
    @TenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const csvContent = file.buffer.toString('utf-8');
    const leads = await this.csvService.parseLeads(csvContent);
    return this.leadService.bulkCreate(tenantId, leads);
  }

  // --- Bulk Campaigns ---
  @Post('campaigns/start')
  @ApiOperation({ summary: 'Start a bulk AI calling campaign' })
  startCampaign(
    @TenantId() tenantId: string,
    @Body() body: { agentId: string; leadIds: string[] }
  ) {
    return this.campaignService.startBulkCampaign(tenantId, body.agentId, body.leadIds);
  }
}
