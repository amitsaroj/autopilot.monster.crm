import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';
import { ConversationService } from './conversation.service';
import { CreateConversationDto, AddConversationMessageDto } from './dto/conversation.dto';

@ApiTags('AI Conversations')
@ResourcePermissions('ai')
@PlanFeature('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/conversations')
export class ConversationsController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  @ApiOperation({ summary: 'List AI conversations' })
  async list(
    @TenantId() tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return await this.conversationService.findPaginated(
      tenantId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create AI conversation' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateConversationDto) {
    return await this.conversationService.create(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation with messages' })
  async getOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.conversationService.findOneWithMessages(tenantId, id);
    if (!data) {
      throw new NotFoundException('Conversation not found');
    }
    return data;
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add message to conversation' })
  async addMessage(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AddConversationMessageDto,
  ) {
    return await this.conversationService.addMessage(
      tenantId,
      id,
      dto.role ?? 'USER',
      dto.content,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete conversation' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.conversationService.remove(tenantId, id);
    return null;
  }

  @Post(':id/handoff')
  @ApiOperation({ summary: 'Hand off conversation to human agent' })
  async handoff(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.conversationService.handoff(tenantId, id);
  }
}
