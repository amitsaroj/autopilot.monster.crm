import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateBrandingDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customDomain?: string;
}

export class VerifyDomainDto {
  @ApiProperty()
  @IsString()
  domain!: string;
}
