import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsUUID } from 'class-validator';

export class InstallWhatsappAutomationDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Fields declared by the product configSchema',
  })
  @IsObject()
  config!: Record<string, unknown>;
}

export class PreviewWhatsappAutomationDto extends InstallWhatsappAutomationDto {
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class RunWhatsappAutomationDto {
  @IsObject()
  payload!: Record<string, unknown>;

  @IsUUID('4')
  requestId!: string;
}
