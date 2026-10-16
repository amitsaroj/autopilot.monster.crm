import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsUUID,
  IsInt,
  Max,
  Matches,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class WhatsappInboxQueryDto extends PaginationDto {
  @ApiProperty({ example: 50, required: false, default: 50, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 50;

  @ApiPropertyOptional({ description: 'Restrict the inbox summary to one normalized phone number' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Restrict a phone thread to one connected sender number' })
  @IsString()
  @Matches(/^[1-9][0-9]{0,63}$/)
  @IsOptional()
  phoneNumberId?: string;
}

export class AssignWhatsappConversationDto {
  @ApiProperty()
  @IsUUID()
  assigneeId!: string;
}

export class AssignWhatsappConversationTeamDto {
  @ApiProperty()
  @IsUUID()
  teamId!: string;
}

export class SendConversationMessageDto {
  @ApiProperty()
  @IsString()
  message!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  wabaId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;

  @IsOptional()
  @IsUUID()
  expectedLastOutboundId?: string | null;
}

export class UpdateWhatsappConversationDto {
  @IsOptional()
  @IsIn(['OPEN', 'RESOLVED'])
  status?: 'OPEN' | 'RESOLVED';

  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
}

export class AddWhatsappConversationNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}

export class ResolveWhatsappConversationDto {
  @ApiPropertyOptional()
  @IsOptional()
  note?: string;
}
