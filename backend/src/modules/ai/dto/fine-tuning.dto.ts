import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateFineTuningJobDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'gpt-4o-mini' })
  @IsString()
  baseModel!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  datasetFileKey?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  hyperparameters?: Record<string, unknown>;
}

export class UpdateFineTuningJobDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fineTunedModel?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  hyperparameters?: Record<string, unknown>;
}
