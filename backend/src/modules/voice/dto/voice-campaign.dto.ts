import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const HHMM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const VOICEMAIL_ACTIONS = ['CONTINUE', 'HANGUP'] as const;

export class CreateVoiceCampaignDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty()
  @IsString()
  fromNumber!: string;

  @ApiProperty()
  @IsString()
  script!: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  contactListId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Optional AI agent whose prompt replaces the free-text script' })
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({ default: 3, description: 'Max simultaneous active calls for this campaign' })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  concurrency?: number;

  @ApiPropertyOptional({ default: 1, description: '1 = no retry' })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxAttempts?: number;

  @ApiPropertyOptional({ default: 30 })
  @IsInt()
  @Min(1)
  @Max(1440)
  @IsOptional()
  retryDelayMinutes?: number;

  @ApiPropertyOptional({ example: '09:00' })
  @Matches(HHMM_PATTERN, { message: 'callingHoursStart must be HH:mm' })
  @IsOptional()
  callingHoursStart?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @Matches(HHMM_PATTERN, { message: 'callingHoursEnd must be HH:mm' })
  @IsOptional()
  callingHoursEnd?: string;

  @ApiPropertyOptional({ default: 'UTC', description: 'IANA timezone, e.g. America/New_York' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Hard cap on total dial attempts; the campaign auto-pauses once reached' })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxCalls?: number;

  @ApiPropertyOptional({ description: 'Free-text objective this campaign was generated from, if any' })
  @IsString()
  @IsOptional()
  objective?: string;

  @ApiPropertyOptional({ enum: VOICEMAIL_ACTIONS, default: 'CONTINUE' })
  @IsIn(VOICEMAIL_ACTIONS)
  @IsOptional()
  voicemailAction?: 'CONTINUE' | 'HANGUP';

  @ApiPropertyOptional({ description: 'Number the AI agent can transfer an interested caller to' })
  @IsString()
  @IsOptional()
  humanTransferNumber?: string;
}

export class GenerateVoiceCampaignDraftDto {
  @ApiProperty({
    description: 'What the campaign should achieve, in plain language',
    example:
      'Call all my leads and tell them about our AI CRM annual plan, explain the 30% discount, answer basic questions, qualify interested customers, and arrange a callback with sales.',
  })
  @IsString()
  @MaxLength(2000)
  objective!: string;

  @ApiPropertyOptional({ description: 'Who is being called, if useful context for tone/framing' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  audienceDescription?: string;
}

export class UpdateVoiceCampaignDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fromNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  script?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  contactListId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  totalContacts?: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  concurrency?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxAttempts?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  @IsOptional()
  retryDelayMinutes?: number;

  @ApiPropertyOptional()
  @Matches(HHMM_PATTERN, { message: 'callingHoursStart must be HH:mm' })
  @IsOptional()
  callingHoursStart?: string;

  @ApiPropertyOptional()
  @Matches(HHMM_PATTERN, { message: 'callingHoursEnd must be HH:mm' })
  @IsOptional()
  callingHoursEnd?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  maxCalls?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  objective?: string;

  @ApiPropertyOptional({ enum: VOICEMAIL_ACTIONS })
  @IsIn(VOICEMAIL_ACTIONS)
  @IsOptional()
  voicemailAction?: 'CONTINUE' | 'HANGUP';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  humanTransferNumber?: string;
}
