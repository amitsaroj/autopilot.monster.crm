import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

const ENTITY_TYPES = ['contacts', 'deals', 'companies', 'leads'] as const;

export class StartImportDto {
  @ApiProperty({ enum: ENTITY_TYPES })
  @IsIn(ENTITY_TYPES)
  entityType!: (typeof ENTITY_TYPES)[number];

  @ApiProperty()
  @IsString()
  fileKey!: string;

  @ApiPropertyOptional({
    description: 'Applied to every imported row that supports tags (e.g. contacts) — lets a segment target exactly this import batch afterward.',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class StartExportDto {
  @ApiProperty({ enum: ENTITY_TYPES })
  @IsIn(ENTITY_TYPES)
  entityType!: (typeof ENTITY_TYPES)[number];

  @ApiPropertyOptional({ enum: ['csv', 'json'] })
  @IsIn(['csv', 'json'])
  @IsOptional()
  format?: 'csv' | 'json';
}

export class PresignedUploadDto {
  @ApiProperty()
  @IsString()
  filename!: string;

  @ApiProperty()
  @IsString()
  mimeType!: string;
}
