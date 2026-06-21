import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateWorkflowDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['voice', 'whatsapp'] })
  @IsIn(['voice', 'whatsapp'])
  @IsOptional()
  type?: 'voice' | 'whatsapp';

  @ApiProperty()
  @IsObject()
  definition!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  triggerEvent?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
