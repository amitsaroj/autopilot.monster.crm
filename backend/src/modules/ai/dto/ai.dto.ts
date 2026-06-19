import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional, IsBoolean, IsArray, IsInt, Min, Max } from 'class-validator';

export class GenerateDto {
  @ApiProperty()
  @IsString()
  prompt!: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  options?: Record<string, unknown>;
}

export class ChatDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  conversationId?: string;

  @ApiProperty()
  @IsString()
  message!: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  useRag?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  knowledgeBaseIds?: string[];

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  memoryWindow?: number;
}

export class AnalyzeDto {
  @ApiProperty()
  @IsString()
  text!: string;

  @ApiProperty()
  @IsString()
  task!: string;
}
