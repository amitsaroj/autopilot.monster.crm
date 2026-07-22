import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

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
}
