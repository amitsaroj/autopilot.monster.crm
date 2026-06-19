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
    const data = await this.workflowService.findAll(tenantId);
    return { status: 200, message: 'Workflows retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new workflow' })
  @Roles('TENANT_ADMIN')
  async create(@TenantId() tenantId: string, @Body() dto: CreateWorkflowDto) {
    const data = await this.workflowService.create(tenantId, dto);
    return { status: 201, message: 'Workflow created', error: false, data };
  }

  @Get('executions/:execId')
  @ApiOperation({ summary: 'Get workflow execution detail' })
  async getExecution(@TenantId() tenantId: string, @Param('execId') execId: string) {
    const data = await this.workflowService.getExecution(tenantId, execId);
    return { status: 200, message: 'Execution retrieved', error: false, data };
  }

  @Post('executions/:execId/retry')
  @ApiOperation({ summary: 'Retry a failed workflow execution' })
  @Roles('TENANT_ADMIN')
  async retryExecution(@TenantId() tenantId: string, @Param('execId') execId: string) {
    const data = await this.workflowService.retryExecution(tenantId, execId);
    return { status: 200, message: 'Execution retry queued', error: false, data };
  }

  @Get('executions')
  @ApiOperation({ summary: 'Get workflow execution history' })
  async getExecutions(@TenantId() tenantId: string) {
    const data = await this.workflowService.getExecutions(tenantId);
    return { status: 200, message: 'Executions retrieved', error: false, data };
  }

  @Get('workflow-triggers')
  @ApiOperation({ summary: 'List available workflow trigger types' })
  getTriggers() {
    const data = this.workflowService.getTriggerTypes();
    return { status: 200, message: 'Triggers retrieved', error: false, data };
  }

  @Get('workflow-actions')
  @ApiOperation({ summary: 'List available workflow action types' })
  getActions() {
    const data = this.workflowService.getActionTypes();
    return { status: 200, message: 'Actions retrieved', error: false, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.workflowService.findOne(tenantId, id);
    return { status: 200, message: 'Workflow retrieved', error: false, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workflow' })
  @Roles('TENANT_ADMIN')
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateWorkflowDto>,
  ) {
    const data = await this.workflowService.update(tenantId, id, dto);
    return { status: 200, message: 'Workflow updated', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  @Roles('TENANT_ADMIN')
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.workflowService.remove(tenantId, id);
    return { status: 200, message: 'Workflow deleted', error: false, data: null };
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate workflow' })
  @Roles('TENANT_ADMIN')
  async activate(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.workflowService.activate(tenantId, id);
    return { status: 200, message: 'Workflow activated', error: false, data };
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate workflow' })
  @Roles('TENANT_ADMIN')
  async deactivate(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.workflowService.deactivate(tenantId, id);
    return { status: 200, message: 'Workflow deactivated', error: false, data };
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate workflow' })
  @Roles('TENANT_ADMIN')
  async duplicate(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.workflowService.duplicate(tenantId, id);
    return { status: 201, message: 'Workflow duplicated', error: false, data };
  }

  @Post(':id/trigger')
  @ApiOperation({ summary: 'Manually trigger workflow' })
  async trigger(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const data = await this.workflowService.triggerWorkflow(tenantId, `manual_${id}`, payload, id);
    return { status: 200, message: 'Workflow triggered', error: false, data };
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Manually trigger workflow execution (legacy)' })
  async execute(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const data = await this.workflowService.triggerWorkflow(tenantId, `manual_${id}`, payload, id);
    return { status: 200, message: 'Workflow executed', error: false, data };
  }
}
