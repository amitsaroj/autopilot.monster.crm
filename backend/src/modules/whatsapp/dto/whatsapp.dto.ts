import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

export class SendWhatsappDto {
  @ApiProperty()
  @IsString()
  to!: string;

  @ApiProperty()
  @IsString()
  message!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  wabaId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;
}

export class SendWhatsappTemplateDto {
  @ApiProperty()
  @IsString()
  to!: string;

  @ApiProperty()
  @IsString()
  templateName!: string;

  @ApiPropertyOptional({ default: 'en_US' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsArray()
  @IsOptional()
  components?: unknown[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  wabaId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;

  @IsOptional()
  @IsUUID()
  expectedLastOutboundId?: string | null;
}

export class SendWhatsappContentDto {
  @IsString()
  to!: string;

  @IsObject()
  content!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  wabaId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;

  @IsOptional()
  @IsUUID()
  expectedLastOutboundId?: string | null;
}
