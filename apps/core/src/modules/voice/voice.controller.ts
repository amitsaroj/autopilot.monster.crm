import { Controller, Post, Get, Body, Param, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { TwilioService } from './twilio.service';
import { CallDto, SynthesizeDto } from './dto/voice.dto';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Voice Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('voice')
export class VoiceController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('call')
  @ApiOperation({ summary: 'Initiate an outbound AI call' })
  async initiateCall(@TenantId() tenantId: string, @Body() dto: CallDto) {
    // We'd typically get the host from config or request to build the WSS URL
    const wssUrl = `wss://api.autopilot.monster/voice/stream?tenantId=${tenantId}`;
    const sid = await this.twilioService.initiateOutboundCall(dto.to, wssUrl);
    return { success: true, callSid: sid };
  }

  @Get('calls/:id')
  @ApiOperation({ summary: 'Get call details' })
  async getCall(@TenantId() tenantId: string, @Param('id') id: string) {
    console.log(`Fetching call ${id} for tenant ${tenantId}`);
    return { id, status: 'completed' };
  }

  @Post('synthesize')
  @ApiOperation({ summary: 'Convert text to speech' })
  async synthesize(@Body() dto: SynthesizeDto, @Res() res: Response) {
    console.log(`Synthesizing text: ${dto.text} with voice ${dto.voice || 'default'}`);
    res.json({ message: 'Synthesis logic would go here, returning audio stream/URL' });
  }

  @Post('transcribe')
  @ApiOperation({ summary: 'Convert audio to text' })
  async transcribe(@Body() dto: any) {
    console.log('Transcribing audio', dto);
    return { text: 'Transcription logic would go here' };
  }
}
