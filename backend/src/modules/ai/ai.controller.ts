import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { RagService } from './rag.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { ConversationService } from './conversation.service';
import { GenerateDto, ChatDto, AnalyzeDto } from './dto/ai.dto';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('AI Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly ragService: RagService,
    private readonly kbService: KnowledgeBaseService,
    private readonly chatService: ConversationService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate text completion' })
  async generate(@TenantId() tenantId: string, @Body() dto: GenerateDto) {
    return this.ragService.generate(tenantId, dto.prompt, dto.options);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI (optional RAG)' })
  async chat(@TenantId() tenantId: string, @Body() dto: ChatDto) {
    let context = '';
    if (dto.useRag) {
      context = await this.ragService.queryKnowledgeBase(tenantId, dto.message);
    }

    let conversationId = dto.conversationId;
    if (!conversationId) {
      const conv = await this.chatService.create(tenantId, { title: dto.message.slice(0, 30) });
      conversationId = conv.id;
    }

    const prompt = context ? `Context: ${context}\n\nUser: ${dto.message}` : dto.message;
    const reply = await this.ragService.generate(tenantId, prompt);

    await this.chatService.addMessage(tenantId, conversationId, 'ASSISTANT', reply!);

    return { reply, conversationId };
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze text' })
  async analyze(@TenantId() tenantId: string, @Body() dto: AnalyzeDto) {
    return this.ragService.analyze(tenantId, dto.text, dto.task);
  }

  @Get('models')
  @ApiOperation({ summary: 'List available AI models' })
  async getModels() {
    return this.ragService.getModels();
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get AI usage statistics' })
  async getUsage(@TenantId() tenantId: string) {
    return this.ragService.getUsage(tenantId);
  }

  @Post('knowledge-base/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and index document' })
  async uploadDocument(@TenantId() tenantId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.ragService.processFileAndIndex(
      tenantId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  // --- Knowledge Base Management ---
  @Get('kb')
  @ApiOperation({ summary: 'Get all knowledge bases' })
  async getKBs(@TenantId() tenantId: string) {
    return this.kbService.findAll(tenantId);
  }

  @Post('kb')
  @ApiOperation({ summary: 'Create a knowledge base' })
  async createKB(@TenantId() tenantId: string, @Body() data: any) {
    return this.kbService.create(tenantId, data);
  }

  @Delete('kb/:id')
  @ApiOperation({ summary: 'Delete a knowledge base' })
  async deleteKB(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.kbService.remove(tenantId, id);
  }

  // --- Conversations ---
  @Get('chats')
  @ApiOperation({ summary: 'Get all conversations' })
  async getChats(@TenantId() tenantId: string) {
    return this.chatService.findAll(tenantId);
  }

  @Get('chats/:id/messages')
  @ApiOperation({ summary: 'Get conversation history' })
  async getMessages(@Param('id') id: string) {
    return this.chatService.getMessages(id);
  }
}
