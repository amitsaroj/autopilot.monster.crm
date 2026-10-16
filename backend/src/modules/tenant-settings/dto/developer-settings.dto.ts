import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from '../../../common/constants/permission-resources.constants';

const API_KEY_PERMISSIONS = PERMISSION_RESOURCES.flatMap((resource) =>
  PERMISSION_ACTIONS.map((action) => `${resource}:${action}`),
);

export class CreateApiKeyDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @ArrayMaxSize(100)
  @IsIn(API_KEY_PERMISSIONS, { each: true })
  @IsOptional()
  permissions?: string[];

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100000,
    default: 1000,
    description: 'Maximum requests allowed in the configured global throttle window',
  })
  @IsInt()
  @Min(1)
  @Max(100000)
  @IsOptional()
  rateLimit?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

export class CreateWebhookDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  events!: string[];
}

export class UpdateWebhookDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsUrl({ require_tld: false })
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  events?: string[];

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsIn(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: string;
}

export class CreateOAuthAppDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  redirectUris!: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scopes?: string[];
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  email?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  sms?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  push?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  inApp?: boolean;
}
