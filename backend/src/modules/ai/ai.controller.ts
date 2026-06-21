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
import { GenerateDto, ChatDto, AnalyzeDto } from './dto/ai.dto';
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
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate text completion' })
  async generate(@TenantId() tenantId: string, @Body() dto: GenerateDto) {
    const reply = await this.ragService.generate(tenantId, dto.prompt, dto.options);
    return { status: 200, message: 'Generated', error: false, data: { reply } };
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI (optional RAG)' })
  async chat(@TenantId() tenantId: string, @Body() dto: ChatDto) {
    const { conversationId, reply } = await this.runChat(tenantId, dto);
    return { status: 200, message: 'Chat reply', error: false, data: { reply, conversationId } };
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
    const data = await this.ragService.analyze(tenantId, dto.text, dto.task);
    return { status: 200, message: 'Analysis complete', error: false, data };
  }

  @Get('models')
  @ApiOperation({ summary: 'List available AI models' })
  async getModels() {
    const data = await this.ragService.getModels();
    return { status: 200, message: 'Models retrieved', error: false, data };
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get AI usage statistics' })
  async getUsage(@TenantId() tenantId: string) {
    const data = await this.ragService.getUsage(tenantId);
    return { status: 200, message: 'Usage retrieved', error: false, data };
  }

  @Post('knowledge-base/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and index document' })
  async uploadDocument(@TenantId() tenantId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const data = await this.ragService.processFileAndIndex(
      tenantId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
    return { status: 201, message: 'Document indexed', error: false, data };
  }

  @Get('kb')
  @ApiOperation({ summary: 'Get all knowledge bases' })
  async getKBs(@TenantId() tenantId: string) {
    const data = await this.kbService.findAll(tenantId);
    return { status: 200, message: 'Knowledge bases retrieved', error: false, data };
  }

  @Post('kb')
  @ApiOperation({ summary: 'Create a knowledge base' })
  async createKB(@TenantId() tenantId: string, @Body() data: { name: string; description?: string }) {
    const kb = await this.kbService.create(tenantId, {
      name: data.name,
      description: data.description,
      sourceType: 'FILE',
    });
    return { status: 201, message: 'Knowledge base created', error: false, data: kb };
  }

  @Delete('kb/:id')
  @ApiOperation({ summary: 'Delete a knowledge base' })
  async deleteKB(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.kbService.remove(tenantId, id);
    return { status: 200, message: 'Knowledge base deleted', error: false, data: null };
  }

  @Get('chats')
  @ApiOperation({ summary: 'Get all conversations (legacy)' })
  async getChats(@TenantId() tenantId: string) {
    const data = await this.chatService.findAll(tenantId);
    return { status: 200, message: 'Conversations retrieved', error: false, data };
  }

  @Get('chats/:id/messages')
  @ApiOperation({ summary: 'Get conversation history (legacy)' })
  async getMessages(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.chatService.getMessages(tenantId, id);
    return { status: 200, message: 'Messages retrieved', error: false, data };
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
        const history = recent
          .map((m) => `${m.role}: ${m.content}`)
          .join('\n');
        parts.push(`Memory:\n${history}`);
      }
    }

    parts.push(`User: ${dto.message}`);
    return parts.join('\n\n');
  }
}
