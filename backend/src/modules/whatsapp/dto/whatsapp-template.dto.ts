import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

import {
  WhatsAppTemplateCategory,
  WhatsAppTemplateStatus,
} from '../../../database/entities/whatsapp-template.entity';

export class CreateWhatsappTemplateDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ enum: WhatsAppTemplateCategory })
  @IsEnum(WhatsAppTemplateCategory)
  category!: WhatsAppTemplateCategory;

  @ApiPropertyOptional({ default: 'en_US' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty()
  @IsObject()
  components!: Record<string, unknown>;
}

export class UpdateWhatsappTemplateDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: WhatsAppTemplateCategory })
  @IsEnum(WhatsAppTemplateCategory)
  @IsOptional()
  category?: WhatsAppTemplateCategory;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  components?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: WhatsAppTemplateStatus })
  @IsEnum(WhatsAppTemplateStatus)
  @IsOptional()
  status?: WhatsAppTemplateStatus;
}
