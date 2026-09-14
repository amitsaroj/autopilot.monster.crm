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
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { RagService } from './rag.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { ConversationService } from './conversation.service';
import { AiInferenceQueueService } from './ai-inference-queue.service';
import { GenerateDto, ChatDto, AnalyzeDto } from './dto/ai.dto';
import { CreateLegacyKnowledgeBaseDto } from './dto/knowledge-base.dto';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, PlanFeature, ResourcePermissions } from '../../common/decorators';

@ApiTags('AI Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('ai')
@PlanFeature('ai')
@Controller('ai')
export class AiController {
  constructor(
    private readonly ragService: RagService,
    private readonly kbService: KnowledgeBaseService,
    private readonly chatService: ConversationService,
    private readonly aiInferenceQueue: AiInferenceQueueService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate text completion' })
  async generate(@TenantId() tenantId: string, @Body() dto: GenerateDto) {
    const reply = await this.ragService.generate(tenantId, dto.prompt, dto.options);
    return { reply };
  }

  @Post('generate/async')
  @ApiOperation({ summary: 'Queue text completion for async processing' })
  async generateAsync(@TenantId() tenantId: string, @Body() dto: GenerateDto) {
    const job = await this.aiInferenceQueue.enqueue(tenantId, dto.prompt, {
      model: typeof dto.options?.model === 'string' ? dto.options.model : undefined,
      context: dto.options,
    });
    return { jobId: job.id, status: 'queued' };
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI (optional RAG)' })
  async chat(@TenantId() tenantId: string, @Body() dto: ChatDto) {
    const { conversationId, reply } = await this.runChat(tenantId, dto);
    return { reply, conversationId };
  }

  @Post('chat/stream')
  @ApiOperation({ summary: 'Stream chat with AI (SSE)' })
  async streamChat(
    @TenantId() tenantId: string,
    @Body() dto: ChatDto,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const prompt = await this.buildChatPrompt(tenantId, dto);
    let conversationId = dto.conversationId;
    if (!conversationId) {
      const conv = await this.chatService.create(tenantId, { title: dto.message.slice(0, 30) });
      conversationId = conv.id;
    }

    await this.chatService.addMessage(tenantId, conversationId, 'USER', dto.message);

    let fullReply = '';
    for await (const chunk of this.ragService.streamGenerate(tenantId, prompt, {})) {
      fullReply += chunk;
      res.write(`data: ${JSON.stringify({ chunk, conversationId })}\n\n`);
    }

    await this.chatService.addMessage(tenantId, conversationId, 'ASSISTANT', fullReply);
    res.write(`data: ${JSON.stringify({ done: true, conversationId })}\n\n`);
    res.end();
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze text' })
  async analyze(@TenantId() tenantId: string, @Body() dto: AnalyzeDto) {
    return await this.ragService.analyze(tenantId, dto.text, dto.task);
  }

  @Get('models')
  @ApiOperation({ summary: 'List available AI models' })
  async getModels() {
    return await this.ragService.getModels();
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get AI usage statistics' })
  async getUsage(@TenantId() tenantId: string) {
    const [usage, conversations, knowledgeBases] = await Promise.all([
      this.ragService.getUsage(tenantId),
      this.chatService.findPaginated(tenantId, 1, 1),
      this.kbService.findAll(tenantId),
    ]);

    const embeddings = knowledgeBases.reduce((sum, kb) => {
      const totalChunks = kb.indexMeta?.totalChunks;
      return sum + (typeof totalChunks === 'number' ? totalChunks : 0);
    }, 0);

    return {
      ...usage,
      conversations: conversations.total,
      embeddings,
    };
  }

  @Post('knowledge-base/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and index document' })
  async uploadDocument(@TenantId() tenantId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return await this.ragService.processFileAndIndex(
      tenantId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Get('kb')
  @ApiOperation({ summary: 'Get all knowledge bases' })
  async getKBs(@TenantId() tenantId: string) {
    return await this.kbService.findAll(tenantId);
  }

  @Post('kb')
  @ApiOperation({ summary: 'Create a knowledge base' })
  async createKB(@TenantId() tenantId: string, @Body() dto: CreateLegacyKnowledgeBaseDto) {
    return await this.kbService.create(tenantId, {
      name: dto.name,
      description: dto.description,
      sourceType: 'FILE',
    });
  }

  @Delete('kb/:id')
  @ApiOperation({ summary: 'Delete a knowledge base' })
  async deleteKB(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.kbService.remove(tenantId, id);
    return null;
  }

  @Get('chats')
  @ApiOperation({ summary: 'Get all conversations (legacy)' })
  async getChats(@TenantId() tenantId: string) {
    return await this.chatService.findAll(tenantId);
  }

  @Get('chats/:id/messages')
  @ApiOperation({ summary: 'Get conversation history (legacy)' })
  async getMessages(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.chatService.getMessages(tenantId, id);
  }

  private async runChat(tenantId: string, dto: ChatDto) {
    const prompt = await this.buildChatPrompt(tenantId, dto);

    let conversationId = dto.conversationId;
    if (!conversationId) {
      const conv = await this.chatService.create(tenantId, { title: dto.message.slice(0, 30) });
      conversationId = conv.id;
    }

    await this.chatService.addMessage(tenantId, conversationId, 'USER', dto.message);
    const reply = (await this.ragService.generate(tenantId, prompt)) ?? '';
    await this.chatService.addMessage(tenantId, conversationId, 'ASSISTANT', reply);

    return { conversationId, reply };
  }

  private async buildChatPrompt(tenantId: string, dto: ChatDto): Promise<string> {
    const parts: string[] = [];

    if (dto.useRag) {
      const context = await this.ragService.queryKnowledgeBase(
        tenantId,
        dto.message,
        4,
        dto.knowledgeBaseIds,
      );
      if (context) {
        parts.push(`Context:\n${context}`);
      }
    }

    const memoryWindow = dto.memoryWindow ?? 6;
    if (dto.conversationId && memoryWindow > 0) {
      const messages = await this.chatService.getMessages(tenantId, dto.conversationId);
      const recent = messages.slice(-memoryWindow);
      if (recent.length > 0) {
        const history = recent.map((m) => `${m.role}: ${m.content}`).join('\n');
        parts.push(`Memory:\n${history}`);
      }
    }

    parts.push(`User: ${dto.message}`);
    return parts.join('\n\n');
  }
}
