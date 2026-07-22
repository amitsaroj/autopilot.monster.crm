import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const TEMPLATE_TYPES = ['WORKFLOW', 'VOICE_SCRIPT', 'PROMPT', 'CHATBOT', 'REPORT'] as const;
type TemplateType = (typeof TEMPLATE_TYPES)[number];

export class CreateMarketplaceTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category!: string;

  @ApiProperty({ enum: TEMPLATE_TYPES })
  @IsEnum(TEMPLATE_TYPES)
  type!: TemplateType;

  @ApiProperty()
  @IsObject()
  content!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}

export class UpdateMarketplaceTemplateDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ enum: TEMPLATE_TYPES })
  @IsEnum(TEMPLATE_TYPES)
  @IsOptional()
  type?: TemplateType;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  content?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
