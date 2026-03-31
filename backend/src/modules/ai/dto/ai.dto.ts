import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class GenerateDto {
  @ApiProperty()
  @IsString()
  prompt!: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  options?: any;
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
}

export class AnalyzeDto {
  @ApiProperty()
  @IsString()
  text!: string;

  @ApiProperty()
  @IsString()
  task!: string;
}
