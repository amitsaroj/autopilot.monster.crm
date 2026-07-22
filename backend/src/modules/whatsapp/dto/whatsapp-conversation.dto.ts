import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

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
}

export class ResolveWhatsappConversationDto {
  @ApiPropertyOptional()
  @IsOptional()
  note?: string;
}
