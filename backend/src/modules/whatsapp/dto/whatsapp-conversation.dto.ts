import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsUUID,
} from 'class-validator';

export class AssignWhatsappConversationDto {
  @ApiProperty()
  @IsUUID()
  assigneeId!: string;
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
