import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class SendWhatsappDto {
  @ApiProperty()
  @IsString()
  to!: string;

  @ApiProperty()
  @IsString()
  message!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  wabaId?: string;
}
