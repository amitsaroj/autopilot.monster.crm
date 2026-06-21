import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OmnichannelService } from './omnichannel.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Omnichannel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('omnichannel')
export class OmnichannelController {
  constructor(private readonly omnichannelService: OmnichannelService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a message through the preferred or fallback channel' })
  async sendMessage(
    @TenantId() tenantId: string,
    @Body() dto: { contactId: string; text: string; preferredChannel: 'VOICE' | 'WHATSAPP' | 'EMAIL' | 'WEBCHAT' }
  ) {
    return this.omnichannelService.sendUnifiedMessage(tenantId, dto.contactId, dto.text, dto.preferredChannel);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get unified conversations across all channels' })
  async getConversations(@TenantId() tenantId: string) {
    return this.omnichannelService.getConversations(tenantId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get unified messages for a conversation' })
  async getMessages(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.omnichannelService.getMessages(tenantId, id);
  }

  @Post('conversations/:id/route')
  @ApiOperation({ summary: 'Route conversation to the best agent' })
  async routeConversation(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.omnichannelService.routeToAgent(tenantId, id);
  }
}
