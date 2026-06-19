import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateWhatsappBroadcastDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsUUID()
  templateId!: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  templateVariables?: Record<string, string>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  contactFilter?: {
    tags?: string[];
    status?: string[];
    customField?: { key: string; value: string };
  };

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class ScheduleWhatsappBroadcastDto {
  @ApiProperty()
  @IsDateString()
  scheduledAt!: string;
}
