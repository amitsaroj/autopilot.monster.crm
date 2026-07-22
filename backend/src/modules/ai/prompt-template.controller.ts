import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromptTemplateService } from './prompt-template.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';
import {
  CreatePromptTemplateDto,
  RenderPromptTemplateDto,
  UpdatePromptTemplateDto,
} from './dto/prompt-template.dto';

@ApiTags('AI - Prompt Templates')
@ApiBearerAuth()
@ResourcePermissions('ai')
@PlanFeature('ai')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/templates')
export class PromptTemplateController {
  constructor(private readonly templateService: PromptTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a prompt template' })
  async create(@TenantId() tenantId: string, @Body() dto: CreatePromptTemplateDto) {
    const data = await this.templateService.create(tenantId, dto);
    return { status: 201, message: 'Prompt template created', error: false, data };
  }

  @Get()
  @ApiOperation({ summary: 'List all prompt templates' })
  async findAll(@TenantId() tenantId: string, @Query('category') category?: string) {
    const data = await this.templateService.findAll(tenantId, category);
    return { status: 200, message: 'Prompt templates retrieved', error: false, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prompt template' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.templateService.findOne(tenantId, id);
    return { status: 200, message: 'Prompt template retrieved', error: false, data };
  }

  @Post(':id/render')
  @ApiOperation({ summary: 'Render a prompt template with variables' })
  async render(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: RenderPromptTemplateDto,
  ) {
    const rendered = await this.templateService.render(tenantId, id, body.variables);
    return { status: 200, message: 'Prompt template rendered', error: false, data: { rendered } };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a prompt template' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePromptTemplateDto,
  ) {
    const data = await this.templateService.update(tenantId, id, dto);
    return { status: 200, message: 'Prompt template updated', error: false, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a prompt template' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.templateService.remove(tenantId, id);
  }
}
