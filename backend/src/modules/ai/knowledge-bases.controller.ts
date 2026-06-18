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
import { TenantId } from '../../common/decorators';
import { KnowledgeBaseService } from './knowledge-base.service';
import { RagService } from './rag.service';
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from './dto/knowledge-base.dto';

@ApiTags('AI Knowledge Bases')
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
    const data = await this.kbService.findAll(tenantId);
    return { status: 200, message: 'Knowledge bases retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create knowledge base' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateKnowledgeBaseDto) {
    const data = await this.kbService.create(tenantId, dto);
    return { status: 201, message: 'Knowledge base created', error: false, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get knowledge base detail' })
  async getOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.kbService.findOne(tenantId, id);
    if (!data) {
      throw new NotFoundException('Knowledge base not found');
    }
    return { status: 200, message: 'Knowledge base retrieved', error: false, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update knowledge base' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateKnowledgeBaseDto,
  ) {
    const data = await this.kbService.update(tenantId, id, dto);
    return { status: 200, message: 'Knowledge base updated', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete knowledge base' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.kbService.remove(tenantId, id);
    return { status: 200, message: 'Knowledge base deleted', error: false, data: null };
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Trigger knowledge base re-index' })
  async sync(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.kbService.sync(tenantId, id);
    return { status: 200, message: 'Re-index triggered', error: false, data };
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
    const data = await this.ragService.processFileAndIndex(
      tenantId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
    return { status: 201, message: 'Document indexed', error: false, data };
  }

  @Delete(':id/documents/:docId')
  @ApiOperation({ summary: 'Remove document from knowledge base' })
  async removeDocument(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Param('docId') docId: string,
  ) {
    const data = await this.kbService.removeDocument(tenantId, id, docId);
    return { status: 200, message: 'Document removed', error: false, data };
  }
}
