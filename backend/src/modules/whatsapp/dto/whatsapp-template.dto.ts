import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, ValidateIf, IsString, MaxLength, Matches } from 'class-validator';

import { WhatsAppTemplateCategory } from '../../../database/entities/whatsapp-template.entity';

export class CreateWhatsappTemplateDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9_]+$/)
  name!: string;

  @ApiProperty({ enum: WhatsAppTemplateCategory })
  @IsEnum(WhatsAppTemplateCategory)
  category!: WhatsAppTemplateCategory;

  @ApiPropertyOptional({ default: 'en_US' })
  @IsString()
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @MaxLength(10)
  @Matches(/^[a-z]{2,3}(?:_[A-Z]{2})?$/)
  language?: string;

  @ApiProperty()
  @IsObject()
  components!: Record<string, unknown>;
}

export class WhatsappTemplateAccountDto {
  @ApiPropertyOptional({ description: 'Connected provider phone number ID for this tenant' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsString()
  @Matches(/^[1-9][0-9]{0,63}$/)
  wabaId?: string;
}

export class UpdateWhatsappTemplateDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9_]+$/)
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  name?: string;

  @ApiPropertyOptional({ enum: WhatsAppTemplateCategory })
  @IsEnum(WhatsAppTemplateCategory)
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  category?: WhatsAppTemplateCategory;

  @ApiPropertyOptional()
  @IsString()
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @MaxLength(10)
  @Matches(/^[a-z]{2,3}(?:_[A-Z]{2})?$/)
  language?: string;

  @ApiPropertyOptional()
  @IsObject()
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  components?: Record<string, unknown>;
}
