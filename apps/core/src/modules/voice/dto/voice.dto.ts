import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CallDto {
  @ApiProperty()
  @IsString()
  to!: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class SynthesizeDto {
  @ApiProperty()
  @IsString()
  text!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  voice?: string;
}
