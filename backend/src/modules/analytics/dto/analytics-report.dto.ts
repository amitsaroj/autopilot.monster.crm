import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

import { AnalyticsReportType } from '../../../database/entities/analytics-report.entity';

export class CreateAnalyticsReportDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: AnalyticsReportType })
  @IsEnum(AnalyticsReportType)
  @IsOptional()
  reportType?: AnalyticsReportType;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  schedule?: Record<string, unknown>;
}

export class UpdateAnalyticsReportDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: AnalyticsReportType })
  @IsEnum(AnalyticsReportType)
  @IsOptional()
  reportType?: AnalyticsReportType;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  schedule?: Record<string, unknown>;
}
