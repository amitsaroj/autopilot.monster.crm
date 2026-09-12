import { Controller, Post, Get, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { WhatsappService } from './whatsapp.service';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappBroadcastService } from './whatsapp-broadcast.service';
import { SendWhatsappDto, SendWhatsappTemplateDto } from './dto/whatsapp.dto';
import { CreateWhatsappTemplateDto, UpdateWhatsappTemplateDto } from './dto/whatsapp-template.dto';
import {
  CreateWhatsappBroadcastDto,
  ScheduleWhatsappBroadcastDto,
} from './dto/whatsapp-broadcast.dto';
import {
  AssignWhatsappConversationDto,
  SendConversationMessageDto,
} from './dto/whatsapp-conversation.dto';
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
    return await this.whatsappService.sendTextMessage(tenantId, dto.to, dto.message, dto.wabaId);
  }

  @Post('send-template')
  @ApiOperation({ summary: 'Send a WhatsApp template message' })
  async sendTemplateMessage(@TenantId() tenantId: string, @Body() dto: SendWhatsappTemplateDto) {
    return await this.whatsappService.sendTemplateMessage(
      tenantId,
      dto.to,
      dto.templateName,
      dto.language ?? 'en_US',
      dto.components ?? [],
      dto.wabaId,
    );
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get WhatsApp message history' })
  async getMessages(@TenantId() tenantId: string) {
    return await this.whatsappService.listMessages(tenantId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List WhatsApp conversations' })
  async getConversations(@TenantId() tenantId: string) {
    return await this.whatsappService.listConversations(tenantId);
  }

  @Get('conversations/:phone')
  @ApiOperation({ summary: 'Get conversation messages by phone' })
  async getConversation(@TenantId() tenantId: string, @Param('phone') phone: string) {
    return await this.whatsappService.getConversation(tenantId, phone);
  }

  @Post('conversations/:phone/messages')
  @ApiOperation({ summary: 'Send message in a conversation' })
  async sendConversationMessage(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Body() dto: SendConversationMessageDto,
  ) {
    return await this.whatsappService.sendTextMessage(tenantId, phone, dto.message, dto.wabaId);
  }

  @Post('conversations/:phone/assign')
  @ApiOperation({ summary: 'Assign conversation to an agent' })
  async assignConversation(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Body() dto: AssignWhatsappConversationDto,
  ) {
    return await this.whatsappService.assignConversation(tenantId, phone, dto.assigneeId);
  }

  @Post('conversations/:phone/resolve')
  @ApiOperation({ summary: 'Resolve a conversation' })
  async resolveConversation(@TenantId() tenantId: string, @Param('phone') phone: string) {
    return await this.whatsappService.resolveConversation(tenantId, phone);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List WhatsApp templates' })
  async getTemplates(@TenantId() tenantId: string) {
    return await this.templateService.findAll(tenantId);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create WhatsApp template' })
  async createTemplate(@TenantId() tenantId: string, @Body() dto: CreateWhatsappTemplateDto) {
    return await this.templateService.create(tenantId, dto);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get WhatsApp template detail' })
  async getTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.templateService.findOne(tenantId, id);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update WhatsApp template' })
  async updateTemplate(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWhatsappTemplateDto,
  ) {
    return await this.templateService.update(tenantId, id, dto);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete WhatsApp template' })
  async deleteTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.templateService.remove(tenantId, id);
    return null;
  }

  @Post('templates/:id/sync')
  @ApiOperation({ summary: 'Submit template to Meta for approval' })
  async syncTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.templateService.syncWithMeta(tenantId, id);
  }

  @Get('broadcasts')
  @ApiOperation({ summary: 'List WhatsApp broadcasts' })
  async listBroadcasts(@TenantId() tenantId: string) {
    return await this.broadcastService.findAll(tenantId);
  }

  @Post('broadcasts')
  @ApiOperation({ summary: 'Create WhatsApp broadcast' })
  async createBroadcast(@TenantId() tenantId: string, @Body() dto: CreateWhatsappBroadcastDto) {
    return await this.broadcastService.create(tenantId, dto);
  }

  @Get('broadcasts/:id')
  @ApiOperation({ summary: 'Get broadcast detail' })
  async getBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.broadcastService.findOne(tenantId, id);
  }

  @Post('broadcasts/:id/send')
  @ApiOperation({ summary: 'Send broadcast now' })
  async sendBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.broadcastService.send(tenantId, id);
  }

  @Patch('broadcasts/:id/schedule')
  @ApiOperation({ summary: 'Schedule broadcast' })
  async scheduleBroadcast(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ScheduleWhatsappBroadcastDto,
  ) {
    return await this.broadcastService.schedule(tenantId, id, dto);
  }

  @Delete('broadcasts/:id')
  @ApiOperation({ summary: 'Delete broadcast' })
  async deleteBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.broadcastService.remove(tenantId, id);
    return null;
  }

  @Get('inbox/sla')
  @ApiOperation({ summary: 'Get shared inbox SLA metrics' })
  async getInboxSLA(@TenantId() tenantId: string) {
    return await this.whatsappService.calculateInboxSLA(tenantId);
  }

  @Get('flow-builder/nodes')
  @ApiOperation({ summary: 'Get flow builder node definitions' })
  async getFlowNodes(@TenantId() tenantId: string) {
    return this.whatsappService.getFlowBuilderNodes(tenantId);
  }
}
