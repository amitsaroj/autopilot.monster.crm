import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsEnum, MaxLength } from 'class-validator';
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

