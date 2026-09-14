import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/workflow.dto';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Roles, TenantId, PlanFeature, ResourcePermissions } from '../../common/decorators';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ResourcePermissions('workflow')
@PlanFeature('workflow')
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workflows' })
  async findAll(@TenantId() tenantId: string) {
    return await this.workflowService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new workflow' })
  @Roles('TENANT_ADMIN')
  async create(@TenantId() tenantId: string, @Body() dto: CreateWorkflowDto) {
    return await this.workflowService.create(tenantId, dto);
  }

  @Get('executions/:execId')
  @ApiOperation({ summary: 'Get workflow execution detail' })
  async getExecution(@TenantId() tenantId: string, @Param('execId') execId: string) {
    return await this.workflowService.getExecution(tenantId, execId);
  }

  @Post('executions/:execId/retry')
  @ApiOperation({ summary: 'Retry a failed workflow execution' })
  @Roles('TENANT_ADMIN')
  async retryExecution(@TenantId() tenantId: string, @Param('execId') execId: string) {
    return await this.workflowService.retryExecution(tenantId, execId);
  }

  @Get('executions')
  @ApiOperation({ summary: 'Get workflow execution history' })
  async getExecutions(@TenantId() tenantId: string) {
    return await this.workflowService.getExecutions(tenantId);
  }

  @Get('workflow-triggers')
  @ApiOperation({ summary: 'List available workflow trigger types' })
  getTriggers() {
    return this.workflowService.getTriggerTypes();
  }

  @Get('workflow-actions')
  @ApiOperation({ summary: 'List available workflow action types' })
  getActions() {
    return this.workflowService.getActionTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.workflowService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workflow' })
  @Roles('TENANT_ADMIN')
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateWorkflowDto>,
  ) {
    return await this.workflowService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  @Roles('TENANT_ADMIN')
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.workflowService.remove(tenantId, id);
    return null;
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate workflow' })
  @Roles('TENANT_ADMIN')
  async activate(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.workflowService.activate(tenantId, id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate workflow' })
  @Roles('TENANT_ADMIN')
  async deactivate(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.workflowService.deactivate(tenantId, id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate workflow' })
  @Roles('TENANT_ADMIN')
  async duplicate(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.workflowService.duplicate(tenantId, id);
  }

  @Post(':id/trigger')
  @ApiOperation({ summary: 'Manually trigger workflow' })
  async trigger(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return await this.workflowService.triggerWorkflow(tenantId, `manual_${id}`, payload, id);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Manually trigger workflow execution (legacy)' })
  async execute(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return await this.workflowService.triggerWorkflow(tenantId, `manual_${id}`, payload, id);
  }
}
