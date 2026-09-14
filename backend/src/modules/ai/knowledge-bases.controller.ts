import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';
import { KnowledgeBaseService } from './knowledge-base.service';
import { RagService } from './rag.service';
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from './dto/knowledge-base.dto';

@ApiTags('AI Knowledge Bases')
@ResourcePermissions('ai')
@PlanFeature('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/knowledge-bases')
export class KnowledgeBasesController {
  constructor(
    private readonly kbService: KnowledgeBaseService,
    private readonly ragService: RagService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge bases' })
  async list(@TenantId() tenantId: string) {
    return await this.kbService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create knowledge base' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateKnowledgeBaseDto) {
    return await this.kbService.create(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get knowledge base detail' })
  async getOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.kbService.findOne(tenantId, id);
    if (!data) {
      throw new NotFoundException('Knowledge base not found');
    }
    return data;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update knowledge base' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateKnowledgeBaseDto,
  ) {
    return await this.kbService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete knowledge base' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.kbService.remove(tenantId, id);
    return null;
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Trigger knowledge base re-index' })
  async sync(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.kbService.sync(tenantId, id);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload document to knowledge base' })
  async uploadDocument(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    await this.kbService.findOne(tenantId, id);
    const indexResult = await this.ragService.processFileAndIndex(
      tenantId,
      file.buffer,
      file.originalname,
      file.mimetype,
      id,
    );

    const kb = await this.kbService.findOne(tenantId, id);
    const indexMeta = { ...(kb?.indexMeta ?? {}) };
    const documents = (indexMeta.documents as Array<Record<string, unknown>> | undefined) ?? [];
    documents.push({
      id: indexResult.documentId,
      fileName: file.originalname,
      chunksIndexed: indexResult.chunksIndexed,
      embeddingTokens: indexResult.embeddingTokens,
      indexedAt: new Date().toISOString(),
    });
    indexMeta.documents = documents;
    indexMeta.totalChunks = documents.reduce((sum, doc) => sum + Number(doc.chunksIndexed ?? 0), 0);

    const data = await this.kbService.update(tenantId, id, {
      status: indexResult.success ? 'READY' : 'FAILED',
      indexMeta,
    });
    return { ...indexResult, knowledgeBase: data };
  }

  @Delete(':id/documents/:docId')
  @ApiOperation({ summary: 'Remove document from knowledge base' })
  async removeDocument(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Param('docId') docId: string,
  ) {
    return await this.kbService.removeDocument(tenantId, id, docId);
  }
}
