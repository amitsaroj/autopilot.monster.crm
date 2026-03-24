import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { SendWhatsappDto } from './dto/whatsapp.dto';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('WhatsApp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a WhatsApp message' })
  async sendMessage(@TenantId() tenantId: string, @Body() dto: SendWhatsappDto) {
    console.log(`Sending WhatsApp for tenant ${tenantId}`);
    const wabaId = dto.wabaId || 'default-waba-id';
    return this.whatsappService.sendTextMessage(dto.to, dto.message, wabaId);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get WhatsApp message history' })
  async getMessages(@TenantId() tenantId: string) {
    console.log(`Fetching messages for ${tenantId}`);
    return [];
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get WhatsApp message templates' })
  async getTemplates(@TenantId() tenantId: string) {
    console.log(`Fetching templates for ${tenantId}`);
    return [];
  }
}
