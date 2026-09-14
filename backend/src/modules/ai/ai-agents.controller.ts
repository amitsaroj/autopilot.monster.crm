import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AgentService } from '../crm/agent.service';
import { AiPromptService } from './ai-prompt.service';
import {
  CreateAiAgentDto,
  CreateAiPromptDto,
  UpdateAiAgentDto,
  UpdateAiPromptDto,
} from './dto/ai-agent.dto';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';

@ApiTags('AI Agents')
@ResourcePermissions('ai')
@PlanFeature('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/agents')
export class AiAgentsController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  @ApiOperation({ summary: 'List AI agents' })
  async findAll(@TenantId() tenantId: string) {
    return await this.agentService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create AI agent' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateAiAgentDto) {
    return await this.agentService.create(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AI agent detail' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.agentService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update AI agent' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAiAgentDto,
  ) {
    return await this.agentService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete AI agent' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.agentService.remove(tenantId, id);
    return null;
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate AI agent' })
  async activate(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.agentService.update(tenantId, id, { isActive: true });
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause AI agent' })
  async pause(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.agentService.update(tenantId, id, { isActive: false });
  }
}

@ApiTags('AI Prompts')
@ResourcePermissions('ai')
@PlanFeature('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/prompts')
export class AiPromptsController {
  constructor(private readonly promptService: AiPromptService) {}

  @Get()
  @ApiOperation({ summary: 'List saved prompts' })
  async findAll(@TenantId() tenantId: string) {
    return await this.promptService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create prompt' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateAiPromptDto) {
    return await this.promptService.create(tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update prompt' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAiPromptDto,
  ) {
    return await this.promptService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete prompt' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.promptService.remove(tenantId, id);
    return null;
  }
}
