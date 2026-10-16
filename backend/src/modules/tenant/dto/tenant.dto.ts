import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsEnum,
  MaxLength,
  IsNotEmpty,
  IsObject,
  Matches,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class UpdateBrandingDto {
  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: 'https://logo.com/image.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '#000000' })
  @IsString()
  @MaxLength(7)
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#ffffff' })
  @IsString()
  @MaxLength(7)
  @IsOptional()
  secondaryColor?: string;
}

/**
 * Fields a tenant admin may change on its own tenant row. Plan, status and
 * overrides are SUPER_ADMIN-only (admin/tenants, admin/tenant-override).
 * customDomain is accepted only to clear it or echo the current value; a new
 * domain must go through POST settings/workspace/verify-domain.
 */
export class UpdateWorkspaceSettingsDto {
  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'acme' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  @MaxLength(100)
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'app.acme.com', nullable: true })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  customDomain?: string | null;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  branding?: Record<string, unknown>;
}

export class VerifyDomainDto {
  @ApiProperty({ example: 'app.acme.com' })
  @IsString()
  @MaxLength(255)
  domain!: string;
}

export class TenantFilterDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsEnum(['ACTIVE', 'TRIAL', 'SUSPENDED', 'DELETED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Acme' })
  @IsString()
  @IsOptional()
  search?: string;
}
