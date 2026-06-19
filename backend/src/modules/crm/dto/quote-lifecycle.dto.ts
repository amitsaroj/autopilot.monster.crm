import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendQuoteDto {
  @ApiProperty()
  @IsEmail()
  to!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  message?: string;
}
