import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @ApiPropertyOptional()
  @IsString()
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
