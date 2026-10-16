import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

const NOTIFICATION_TYPES = ['EMAIL', 'SMS', 'IN_APP', 'WHATSAPP', 'VOICE'] as const;

export class UpsertNotificationTemplateDto {
  @ApiProperty({ enum: NOTIFICATION_TYPES })
  @IsIn(NOTIFICATION_TYPES)
  type!: (typeof NOTIFICATION_TYPES)[number];

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  meta?: Record<string, unknown>;
}
