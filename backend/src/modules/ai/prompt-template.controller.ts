import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromptTemplateService } from './prompt-template.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('AI - Prompt Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/templates')
export class PromptTemplateController {
  constructor(private readonly templateService: PromptTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a prompt template' })
  async create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.templateService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all prompt templates' })
  async findAll(@TenantId() tenantId: string, @Query('category') category?: string) {
    return this.templateService.findAll(tenantId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prompt template' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templateService.findOne(tenantId, id);
  }

  @Post(':id/render')
  @ApiOperation({ summary: 'Render a prompt template with variables' })
  async render(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: { variables: Record<string, string> }) {
    const rendered = await this.templateService.render(tenantId, id, body.variables);
    return { rendered };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a prompt template' })
  async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.templateService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a prompt template' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templateService.remove(tenantId, id);
  }
}
