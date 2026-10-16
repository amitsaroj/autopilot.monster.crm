import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/** Body for tenant_settings-backed sub-admin endpoints (AI config, integrations). */
export class UpsertTenantSettingDto {
  @ApiProperty({ example: 'openai.model' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key!: string;

  @ApiProperty({ description: 'Any JSON value' })
  @IsDefined()
  value!: unknown;

  /** Accepted for UI compatibility; not persisted (no column). */
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;
}

export class ProvisionVoiceNumberDto {
  @ApiProperty({ example: '+15551234567' })
  @IsString()
  @Matches(/^\+?[0-9 ()-]{4,20}$/, { message: 'phoneNumber must be a phone number' })
  phoneNumber!: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsString()
  @MaxLength(56)
  @IsOptional()
  country?: string;
}

export class CreateSubAdminWorkflowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['voice', 'whatsapp'] })
  @IsIn(['voice', 'whatsapp'])
  @IsOptional()
  type?: 'voice' | 'whatsapp';

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  definition?: Record<string, unknown>;
}

export class CreateSubAdminRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;
}
