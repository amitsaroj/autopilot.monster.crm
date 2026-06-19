import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

const CHANNELS = ['VOICE', 'WHATSAPP', 'EMAIL', 'WEBCHAT'] as const;
const ROLES = ['USER', 'ASSISTANT', 'SYSTEM'] as const;

export class CreateConversationDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional({ enum: CHANNELS })
  @IsIn(CHANNELS)
  @IsOptional()
  channel?: (typeof CHANNELS)[number];

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  contactId?: string;
}

export class AddConversationMessageDto {
  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ enum: ROLES })
  @IsIn(ROLES)
  @IsOptional()
  role?: (typeof ROLES)[number];
}
