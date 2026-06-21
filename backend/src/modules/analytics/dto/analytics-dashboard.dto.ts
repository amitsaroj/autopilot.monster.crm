import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAnalyticsDashboardDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  @IsArray()
  @IsOptional()
  widgets?: Array<Record<string, unknown>>;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAnalyticsDashboardDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  @IsArray()
  @IsOptional()
  widgets?: Array<Record<string, unknown>>;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
