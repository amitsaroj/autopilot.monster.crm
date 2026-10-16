import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  Res,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { WhatsappService } from './whatsapp.service';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappBroadcastService } from './whatsapp-broadcast.service';
import {
  SendWhatsappDto,
  SendWhatsappTemplateDto,
  SendWhatsappContentDto,
} from './dto/whatsapp.dto';
import {
  CreateWhatsappTemplateDto,
  UpdateWhatsappTemplateDto,
  WhatsappTemplateAccountDto,
} from './dto/whatsapp-template.dto';
import {
  CreateWhatsappBroadcastDto,
  ReviewWhatsappBroadcastApprovalDto,
  ScheduleWhatsappBroadcastDto,
} from './dto/whatsapp-broadcast.dto';
import {
  AssignWhatsappConversationDto,
  AssignWhatsappConversationTeamDto,
  SendConversationMessageDto,
  UpdateWhatsappConversationDto,
  AddWhatsappConversationNoteDto,
  WhatsappInboxQueryDto,
} from './dto/whatsapp-conversation.dto';
import { WhatsappAnalyticsQueryDto } from './dto/whatsapp-analytics.dto';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { CurrentUser, TenantId, PlanFeature, ResourcePermissions } from '../../common/decorators';
import type { IRequestContext } from '../../common/interfaces/request-context.interface';

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

  @Post('inbox/presence/heartbeat')
  @ApiOperation({ summary: 'Refresh the current teammate’s short-lived WhatsApp inbox presence' })
  inboxPresenceHeartbeat(
    @TenantId() tenantId: string,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.whatsappService.recordInboxPresence(tenantId, user.userId);
  }

  @Get('inbox/presence')
  @ApiOperation({ summary: 'List active tenant members currently present in the WhatsApp inbox' })
  async inboxPresence(@TenantId() tenantId: string) {
    return { onlineUserIds: await this.whatsappService.getOnlineInboxAgentIds(tenantId) };
  }

  @Post('send')
  @ApiOperation({ summary: 'Send a WhatsApp message' })
  async sendMessage(@TenantId() tenantId: string, @Body() dto: SendWhatsappDto) {
    return await this.whatsappService.sendTextMessage(
      tenantId,
      dto.to,
      dto.message,
      dto.wabaId,
      dto.idempotencyKey,
    );
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
      dto.idempotencyKey,
      undefined,
      dto.expectedLastOutboundId,
    );
  }

  @Post('send-content')
  @ApiOperation({
    summary: 'Send supported media references or interactive messages inside the service window',
  })
  sendContent(@TenantId() tenantId: string, @Body() dto: SendWhatsappContentDto) {
    return this.whatsappService.sendContentMessage(
      tenantId,
      dto.to,
      dto.content,
      dto.wabaId,
      dto.idempotencyKey,
      dto.expectedLastOutboundId,
    );
  }

  @Get('analytics')
  analytics(@TenantId() tenantId: string, @Query() query: WhatsappAnalyticsQueryDto) {
    return this.whatsappService.getAnalytics(tenantId, query.from, query.to, query.limit);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get WhatsApp message history' })
  async getMessages(@TenantId() tenantId: string, @Query() query: WhatsappInboxQueryDto) {
    return await this.whatsappService.listMessages(tenantId, query.page, query.limit);
  }

  @Get('messages/:id/media/:index')
  @ApiOperation({ summary: 'Download a tenant-owned inbound WhatsApp media attachment' })
  async downloadMessageMedia(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('index', ParseIntPipe) index: number,
    @Res() response: Response,
  ) {
    const media = await this.whatsappService.downloadMessageMedia(tenantId, id, index);
    response
      .status(200)
      .set({
        'Content-Type': media.mimeType,
        'Content-Length': media.buffer.length,
        'Content-Disposition': 'inline; filename="whatsapp-media"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      })
      .send(media.buffer);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List WhatsApp conversations' })
  async getConversations(@TenantId() tenantId: string, @Query() query: WhatsappInboxQueryDto) {
    return await this.whatsappService.listConversations(
      tenantId,
      query.page,
      query.limit,
      query.phone,
      query.phoneNumberId,
    );
  }

  @Get('conversations/:phone')
  @ApiOperation({ summary: 'Get conversation messages by phone' })
  async getConversation(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Query() query: WhatsappInboxQueryDto,
    @Query('phoneNumberId') phoneNumberId?: string,
  ) {
    return await this.whatsappService.getConversation(
      tenantId,
      phone,
      phoneNumberId,
      query.page,
      query.limit,
    );
  }

  @Post('conversations/:phone/messages')
  @ApiOperation({ summary: 'Send message in a conversation' })
  async sendConversationMessage(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Body() dto: SendConversationMessageDto,
  ) {
    return await this.whatsappService.sendTextMessage(
      tenantId,
      phone,
      dto.message,
      dto.wabaId,
      dto.idempotencyKey,
      dto.expectedLastOutboundId,
    );
  }

  @Patch('conversations/:phone')
  updateConversation(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Body() dto: UpdateWhatsappConversationDto,
  ) {
    return this.whatsappService.updateConversation(tenantId, phone, dto);
  }

  @Post('conversations/:phone/read')
  markRead(@TenantId() tenantId: string, @Param('phone') phone: string) {
    return this.whatsappService.markConversationRead(tenantId, phone);
  }

  @Get('conversations/:phone/notes')
  notes(@TenantId() tenantId: string, @Param('phone') phone: string) {
    return this.whatsappService.conversationNotes(tenantId, phone);
  }

  @Post('conversations/:phone/notes')
  addNote(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Body() dto: AddWhatsappConversationNoteDto,
    @CurrentUser() actor: IRequestContext,
  ) {
    return this.whatsappService.addConversationNote(tenantId, phone, dto.content, actor.userId);
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

  @Post('conversations/:phone/assign/round-robin')
  @ApiOperation({ summary: 'Assign to the next active teammate in the tenant round-robin' })
  assignConversationRoundRobin(@TenantId() tenantId: string, @Param('phone') phone: string) {
    return this.whatsappService.assignConversationRoundRobin(tenantId, phone);
  }

  @Post('conversations/:phone/assign/online')
  @ApiOperation({ summary: 'Assign round-robin to an online tenant teammate' })
  assignConversationOnline(@TenantId() tenantId: string, @Param('phone') phone: string) {
    return this.whatsappService.assignConversationToOnlineTeammate(tenantId, phone);
  }

  @Post('conversations/:phone/assign/team')
  @ApiOperation({ summary: 'Route a conversation to a team using team-member round-robin' })
  assignConversationToTeam(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Body() dto: AssignWhatsappConversationTeamDto,
  ) {
    return this.whatsappService.assignConversationToTeam(tenantId, phone, dto.teamId);
  }

  @Post('conversations/:phone/resolve')
  @ApiOperation({ summary: 'Resolve a conversation' })
  async resolveConversation(@TenantId() tenantId: string, @Param('phone') phone: string) {
    return await this.whatsappService.resolveConversation(tenantId, phone);
  }

  @Post('conversations/:phone/csat')
  @ApiOperation({ summary: 'Request a 1–5 satisfaction rating for a resolved conversation' })
  requestConversationCsat(@TenantId() tenantId: string, @Param('phone') phone: string) {
    return this.whatsappService.requestConversationCsat(tenantId, phone);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List WhatsApp templates' })
  async getTemplates(@TenantId() tenantId: string) {
    return await this.templateService.findAll(tenantId);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create WhatsApp template' })
  async createTemplate(
    @TenantId() tenantId: string,
    @Body() dto: CreateWhatsappTemplateDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return await this.templateService.create(tenantId, dto, user.userId);
  }

  @Post('templates/refresh')
  refreshTemplates(
    @TenantId() tenantId: string,
    @Body() dto: WhatsappTemplateAccountDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.templateService.refreshAll(tenantId, dto.wabaId, user.userId);
  }
  @Post('templates/import')
  @ApiOperation({ summary: 'Import supported templates from the selected connected Meta account' })
  importTemplates(
    @TenantId() tenantId: string,
    @Body() dto: WhatsappTemplateAccountDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.templateService.importFromMeta(tenantId, dto.wabaId, user.userId);
  }
  @Post('templates/:id/refresh')
  refreshTemplate(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: WhatsappTemplateAccountDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.templateService.refreshStatus(tenantId, id, dto.wabaId, user.userId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get WhatsApp template detail' })
  async getTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.templateService.findOne(tenantId, id);
  }

  @Get('templates/:id/history')
  @ApiOperation({ summary: 'List tenant-owned immutable WhatsApp template snapshots' })
  getTemplateHistory(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templateService.findHistoryForTemplate(tenantId, id);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update WhatsApp template' })
  async updateTemplate(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWhatsappTemplateDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return await this.templateService.update(tenantId, id, dto, user.userId);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete WhatsApp template' })
  async deleteTemplate(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: IRequestContext,
  ) {
    await this.templateService.remove(tenantId, id, user.userId);
    return null;
  }

  @Post('templates/:id/sync')
  @ApiOperation({ summary: 'Submit template to Meta for approval' })
  async syncTemplate(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: WhatsappTemplateAccountDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return await this.templateService.syncWithMeta(tenantId, id, dto.wabaId, user.userId);
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

  @Get('broadcasts/:id/preview')
  previewBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.broadcastService.preview(tenantId, id);
  }
  @Post('broadcasts/:id/approval/request')
  @ApiOperation({ summary: 'Submit a WhatsApp broadcast draft for owner/admin review' })
  requestBroadcastApproval(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.broadcastService.requestApproval(tenantId, id, user.userId);
  }
  @Post('broadcasts/:id/approval/review')
  @ApiOperation({ summary: 'Approve or reject a pending WhatsApp broadcast' })
  reviewBroadcastApproval(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ReviewWhatsappBroadcastApprovalDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.broadcastService.reviewApproval(
      tenantId,
      id,
      user.userId,
      user.roles,
      dto.decision,
      dto.note,
    );
  }
  @Get('broadcasts/:id/recipients')
  recipients(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Query('after') after?: string,
  ) {
    return this.broadcastService.recipients(tenantId, id, after);
  }
  @Get('broadcasts/:id/recipients/export')
  @ApiOperation({ summary: 'Stream a formula-safe CSV of every prepared campaign recipient' })
  async exportRecipients(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    const name = await this.broadcastService.assertRecipientExportable(tenantId, id);
    const safeName = name
      .replace(/[^a-z0-9_-]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="whatsapp-${safeName || 'campaign'}-recipients.csv"`,
    );
    response.setHeader('Cache-Control', 'private, no-store');
    await pipeline(Readable.from(this.broadcastService.streamRecipientCsv(tenantId, id)), response);
  }
  @Post('broadcasts/:id/duplicate')
  duplicateBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.broadcastService.duplicate(tenantId, id);
  }
  @Post('broadcasts/:id/pause')
  pauseBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.broadcastService.pause(tenantId, id);
  }
  @Post('broadcasts/:id/resume')
  resumeBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.broadcastService.resume(tenantId, id);
  }
  @Post('broadcasts/:id/cancel')
  cancelBroadcast(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.broadcastService.cancel(tenantId, id);
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
