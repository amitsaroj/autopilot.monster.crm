import { IsString, IsOptional, IsArray, IsInt, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Human-readable name for this API key' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Scopes for the key', default: ['*'] })
  @IsOptional()
  @IsArray()
  scopes?: string[];

  @ApiPropertyOptional({ description: 'Rate limit per hour', default: 1000 })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100000)
  rateLimit?: number;

  @ApiPropertyOptional({ description: 'Expiry date (ISO string)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class RevokeApiKeyDto {
  @ApiProperty({ description: 'Reason for revocation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'User ID of team leader' })
  @IsOptional()
  @IsString()
  leaderId?: string;

  @ApiPropertyOptional({ description: 'Array of user IDs to add as members' })
  @IsOptional()
  @IsArray()
  memberIds?: string[];
}

export class UpdateTeamDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leaderId?: string;
}

export class CreateFeatureFlagDto {
  @ApiProperty({ description: 'Unique key, e.g. "ai_voice_calling"' })
  @IsString()
  key!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Plan slugs allowed', default: [] })
  @IsOptional()
  @IsArray()
  allowedPlans?: string[];

  @ApiPropertyOptional({ description: 'Rollout percentage', default: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;
}
