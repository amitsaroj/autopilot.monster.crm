import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateVoiceCampaignDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty()
  @IsString()
  fromNumber!: string;

  @ApiProperty()
  @IsString()
  script!: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  contactListId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  scheduledAt?: string;
}

export class UpdateVoiceCampaignDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fromNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  script?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  contactListId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  totalContacts?: number;
}
