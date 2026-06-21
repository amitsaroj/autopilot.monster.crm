import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class MoveDealStageDto {
  @ApiProperty()
  @IsUUID()
  stageId!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}

export class MarkDealLostDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lostReason?: string;
}

export class CreateContactNoteDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;
}
