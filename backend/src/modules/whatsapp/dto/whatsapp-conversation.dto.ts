import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AssignWhatsappConversationDto {
  @ApiProperty()
  @IsUUID()
  assigneeId!: string;
}

export class ResolveWhatsappConversationDto {
  @ApiPropertyOptional()
  @IsOptional()
  note?: string;
}
