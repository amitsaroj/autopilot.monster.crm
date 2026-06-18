import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AgentService } from '../crm/agent.service';
import { AiPromptService } from './ai-prompt.service';
import { CreateAiAgentDto, CreateAiPromptDto, UpdateAiAgentDto, UpdateAiPromptDto } from './dto/ai-agent.dto';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('AI Agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/agents')
export class AiAgentsController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  @ApiOperation({ summary: 'List AI agents' })
  async findAll(@TenantId() tenantId: string) {
    const data = await this.agentService.findAll(tenantId);
    return { status: 200, message: 'Agents retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create AI agent' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateAiAgentDto) {
    const data = await this.agentService.create(tenantId, dto);
    return { status: 201, message: 'Agent created', error: false, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AI agent detail' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.agentService.findOne(tenantId, id);
    return { status: 200, message: 'Agent retrieved', error: false, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update AI agent' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAiAgentDto,
  ) {
    const data = await this.agentService.update(tenantId, id, dto);
    return { status: 200, message: 'Agent updated', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete AI agent' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.agentService.remove(tenantId, id);
    return { status: 200, message: 'Agent deleted', error: false, data: null };
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate AI agent' })
  async activate(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.agentService.update(tenantId, id, { isActive: true });
    return { status: 200, message: 'Agent activated', error: false, data };
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause AI agent' })
  async pause(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.agentService.update(tenantId, id, { isActive: false });
    return { status: 200, message: 'Agent paused', error: false, data };
  }
}

@ApiTags('AI Prompts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/prompts')
export class AiPromptsController {
  constructor(private readonly promptService: AiPromptService) {}

  @Get()
  @ApiOperation({ summary: 'List saved prompts' })
  async findAll(@TenantId() tenantId: string) {
    const data = await this.promptService.findAll(tenantId);
    return { status: 200, message: 'Prompts retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create prompt' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateAiPromptDto) {
    const data = await this.promptService.create(tenantId, dto);
    return { status: 201, message: 'Prompt created', error: false, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update prompt' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAiPromptDto,
  ) {
    const data = await this.promptService.update(tenantId, id, dto);
    return { status: 200, message: 'Prompt updated', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete prompt' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.promptService.remove(tenantId, id);
    return { status: 200, message: 'Prompt deleted', error: false, data: null };
  }
}
