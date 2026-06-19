import { Controller, Post, Get, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { WhatsappService } from './whatsapp.service';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappBroadcastService } from './whatsapp-broadcast.service';
import { SendWhatsappDto } from './dto/whatsapp.dto';
import { CreateWhatsappTemplateDto, UpdateWhatsappTemplateDto } from './dto/whatsapp-template.dto';
import {
  CreateWhatsappBroadcastDto,
  ScheduleWhatsappBroadcastDto,
} from './dto/whatsapp-broadcast.dto';
import { AssignWhatsappConversationDto } from './dto/whatsapp-conversation.dto';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, PlanFeature, ResourcePermissions } from '../../common/decorators';

@ApiTags('WhatsApp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('whatsapp')
@PlanFeature('whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly templateService: WhatsappTemplateService,
    private readonly broadcastService: WhatsappBroadcastService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a WhatsApp message' })
  async sendMessage(@TenantId() tenantId: string, @Body() dto: SendWhatsappDto) {
    const data = await this.whatsappService.sendTextMessage(
      tenantId,
      dto.to,
      dto.message,
      dto.wabaId,
    );
    return { status: 201, message: 'Message sent', error: false, data };
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get WhatsApp message history' })
  async getMessages(@TenantId() tenantId: string) {
    const data = await this.whatsappService.listMessages(tenantId);
    return { status: 200, message: 'Messages retrieved', error: false, data };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List WhatsApp conversations' })
  async getConversations(@TenantId() tenantId: string) {
    const data = await this.whatsappService.listConversations(tenantId);
    return { status: 200, message: 'Conversations retrieved', error: false, data };
  }

  @Get('conversations/:phone')
  @ApiOperation({ summary: 'Get conversation messages by phone' })
  async getConversation(@TenantId() tenantId: string, @Param('phone') phone: string) {
    const data = await this.whatsappService.getConversation(tenantId, phone);
    return { status: 200, message: 'Conversation retrieved', error: false, data };
  }

  @Post('conversations/:phone/messages')
  @ApiOperation({ summary: 'Send message in a conversation' })
  async sendConversationMessage(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Body() dto: { message: string; wabaId?: string },
  ) {
    const data = await this.whatsappService.sendTextMessage(
      tenantId,
      phone,
      dto.message,
      dto.wabaId,
    );
    return { status: 201, message: 'Message sent', error: false, data };
  }

  @Post('conversations/:phone/assign')
  @ApiOperation({ summary: 'Assign conversation to an agent' })
  async assignConversation(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Body() dto: AssignWhatsappConversationDto,
  ) {
    const data = await this.whatsappService.assignConversation(tenantId, phone, dto.assigneeId);
    return { status: 200, message: 'Conversation assigned', error: false, data };
  }

  @Post('conversations/:phone/resolve')
  @ApiOperation({ summary: 'Resolve a conversation' })
  async resolveConversation(@TenantId() tenantId: string, @Param('phone') phone: string) {
    const data = await this.whatsappService.resolveConversation(tenantId, phone);
    return { status: 200, message: 'Conversation resolved', error: false, data };
  }

  @Get('templates')
  @ApiOperation({ summary: 'List WhatsApp templates' })
  async getTemplates(@TenantId() tenantId: string) {
    const data = await this.templateService.findAll(tenantId);
    return { status: 200, message: 'Templates retrieved', error: false, data };
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create WhatsApp template' })
  async createTemplate(@TenantId() tenantId: string, @Body() dto: CreateWhatsappTemplateDto) {
    const data = await this.templateService.create(tenantId, dto);
    return { status: 201, message: 'Template created', error: false, data };
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get WhatsApp template detail' })
  async getTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.templateService.findOne(tenantId, id);
    return { status: 200, message: 'Template retrieved', error: false, data };
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update WhatsApp template' })
  async updateTemplate(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWhatsappTemplateDto,
  ) {
    const data = await this.templateService.update(tenantId, id, dto);
    return { status: 200, message: 'Template updated', error: false, data };
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete WhatsApp template' })
  async deleteTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.templateService.remove(tenantId, id);
    return { status: 200, message: 'Template deleted', error: false, data: null };
  }

  @Post('templates/:id/sync')
  @ApiOperation({ summary: 'Submit template to Meta for approval' })
  async syncTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.templateService.syncWithMeta(tenantId, id);
    return { status: 200, message: 'Template sync submitted', error: false, data };
  }

  @Get('broadcasts')
  @ApiOperation({ summary: 'List WhatsApp broadcasts' })
  async listBroadcasts(@TenantId() tenantId: string) {
    const data = await this.broadcastService.findAll(tenantId);
    return { status: 200, message: 'Broadcasts retrieved', error: false, data };
  }

  @Post('broadcasts')
  @ApiOperation({ summary: 'Create WhatsApp broadcast' })
  async createBroadcast(@TenantId() tenantId: string, @Body() dto: CreateWhatsappBroadcastDto) {
    const data = await this.broadcastService.create(tenantId, dto);
    return { status: 201, message: 'Broadcast created', error: false, data };
  }

  @Get('broadcasts/:id')
  @ApiOperation({ summary: 'Get broadcast detail' })
  async getBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.broadcastService.findOne(tenantId, id);
    return { status: 200, message: 'Broadcast retrieved', error: false, data };
  }

  @Post('broadcasts/:id/send')
  @ApiOperation({ summary: 'Send broadcast now' })
  async sendBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.broadcastService.send(tenantId, id);
    return { status: 200, message: 'Broadcast sent', error: false, data };
  }

  @Patch('broadcasts/:id/schedule')
  @ApiOperation({ summary: 'Schedule broadcast' })
  async scheduleBroadcast(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ScheduleWhatsappBroadcastDto,
  ) {
    const data = await this.broadcastService.schedule(tenantId, id, dto);
    return { status: 200, message: 'Broadcast scheduled', error: false, data };
  }

  @Delete('broadcasts/:id')
  @ApiOperation({ summary: 'Delete broadcast' })
  async deleteBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.broadcastService.remove(tenantId, id);
    return { status: 200, message: 'Broadcast deleted', error: false, data: null };
  }
}
