import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateKnowledgeBaseDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ['FILE', 'URL', 'TEXT', 'INTEGRATION'] })
  @IsString()
  sourceType!: 'FILE' | 'URL' | 'TEXT' | 'INTEGRATION';

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  sourceConfig?: Record<string, unknown>;
}

export class UpdateKnowledgeBaseDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  sourceConfig?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ['PROCESSING', 'READY', 'FAILED'] })
  @IsString()
  @IsOptional()
  status?: 'PROCESSING' | 'READY' | 'FAILED';

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  indexMeta?: Record<string, unknown>;
}

export class UploadKnowledgeBaseDocumentDto {
  @ApiProperty()
  @IsUUID()
  knowledgeBaseId!: string;
}
