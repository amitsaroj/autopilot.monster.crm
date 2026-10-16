import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { PlanFeature, ResourcePermissions, TenantId } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { ConnectWhatsappAccountDto, EmbeddedSignupDto } from './dto/whatsapp-account.dto';
import { WhatsappAccountService } from './whatsapp-account.service';
import { WhatsappProviderRegistry } from './whatsapp-provider';

const MEDIA_TYPES: Record<string, (buffer: Buffer) => boolean> = {
  'image/jpeg': (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  'image/png': (buffer) => buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  'video/mp4': (buffer) => buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp',
  'video/3gpp': (buffer) => buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp' && buffer.toString('ascii', 8, 11) === '3gp',
  'audio/aac': (buffer) => buffer.length >= 2 && buffer[0] === 0xff && (buffer[1] & 0xf6) === 0xf0,
  'audio/mp4': (buffer) => buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp',
  'audio/mpeg': (buffer) => buffer.subarray(0, 3).toString() === 'ID3' || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0),
  'audio/amr': (buffer) => buffer.subarray(0, 6).toString() === '#!AMR\n',
  'audio/ogg': (buffer) => buffer.subarray(0, 4).toString() === 'OggS',
  'application/pdf': (buffer) => buffer.subarray(0, 5).toString() === '%PDF-',
  'text/plain': (buffer) => {
    try {
      const value = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      for (const character of value) {
        const code = character.codePointAt(0) ?? 0;
        if ((code < 32 && ![9, 10, 13].includes(code)) || code === 127) return false;
      }
      return true;
    } catch {
      return false;
    }
  },
  'application/msword': (buffer) => buffer.subarray(0, 8).equals(Buffer.from([208, 207, 17, 224, 161, 177, 26, 225])),
  'application/vnd.ms-powerpoint': (buffer) => buffer.subarray(0, 8).equals(Buffer.from([208, 207, 17, 224, 161, 177, 26, 225])),
  'application/vnd.ms-excel': (buffer) => buffer.subarray(0, 8).equals(Buffer.from([208, 207, 17, 224, 161, 177, 26, 225])),
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (buffer) => buffer.subarray(0, 4).toString() === 'PK\u0003\u0004',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': (buffer) => buffer.subarray(0, 4).toString() === 'PK\u0003\u0004',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': (buffer) => buffer.subarray(0, 4).toString() === 'PK\u0003\u0004',
};

@ApiTags('WhatsApp accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('whatsapp')
@PlanFeature('whatsapp')
@Controller('whatsapp/accounts')
export class WhatsappAccountController {
  constructor(
    private readonly accounts: WhatsappAccountService,
    private readonly providers: WhatsappProviderRegistry,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List tenant WhatsApp accounts and provider capabilities' })
  list(@TenantId() tenantId: string) {
    return this.accounts.list(tenantId);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Validate Meta phone/WABA access and connect a tenant account' })
  connect(
    @TenantId() tenantId: string,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validationError: { target: false, value: false },
      }),
    )
    dto: ConnectWhatsappAccountDto,
  ) {
    return this.accounts.connect(tenantId, dto);
  }

  @Post('embedded-signup')
  @ApiOperation({
    summary:
      'Complete Meta Embedded Signup: exchange code, validate WABA/phone, store token, subscribe app',
  })
  embeddedSignup(
    @TenantId() tenantId: string,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validationError: { target: false, value: false },
      }),
    )
    dto: EmbeddedSignupDto,
  ) {
    return this.accounts.embeddedSignup(tenantId, dto);
  }

  @Post('media/:phoneNumberId')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 16 * 1024 * 1024, files: 1 },
      fileFilter: (_request, file, callback) =>
        Object.prototype.hasOwnProperty.call(MEDIA_TYPES, file.mimetype)
          ? callback(null, true)
          : callback(new BadRequestException('Upload JPG, PNG, MP4, MP3, OGG or PDF media'), false),
    }),
  )
  @ApiOperation({ summary: 'Upload supported media directly to the connected Meta phone number' })
  async uploadMedia(
    @TenantId() tenantId: string,
    @Param('phoneNumberId') phoneNumberId: string,
    @Query('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const typeMatches =
      (type === 'image' && file?.mimetype.startsWith('image/')) ||
      (type === 'video' && file?.mimetype.startsWith('video/')) ||
      (type === 'audio' && file?.mimetype.startsWith('audio/')) ||
      (type === 'document' && (file?.mimetype.startsWith('application/') || file?.mimetype === 'text/plain'));
    if (!file || !file.buffer || !typeMatches || !MEDIA_TYPES[file.mimetype]?.(file.buffer)) {
      throw new BadRequestException('Media content does not match a supported file format');
    }
    const credentials = await this.accounts.getCredentials(tenantId, phoneNumberId);
    const mediaId = await this.providers
      .get(credentials.provider)
      .uploadMedia(credentials, file.buffer, file.mimetype, file.originalname);
    return { mediaId, mimeType: file.mimetype, filename: file.originalname.slice(0, 255) };
  }

  @Get(':id/health')
  @ApiOperation({
    summary:
      'Diagnose token, WABA ownership, webhook subscription and quality from Meta; persists the result',
  })
  health(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.accounts.health(tenantId, id);
  }

  @Post(':id/disconnect')
  @ApiOperation({
    summary:
      'Erase local credentials (retaining phone ownership); best-effort Meta app unsubscribe for the last number on a WABA',
  })
  disconnect(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.accounts.disconnect(tenantId, id);
  }
}
