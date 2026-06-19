import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CallDto {
  @ApiProperty()
  @IsString()
  to!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({ description: 'OpenAI realtime voice profile (e.g. shimmer, alloy)' })
  @IsString()
  @IsOptional()
  voice?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class TransferCallDto {
  @ApiProperty()
  @IsString()
  to!: string;
}

export class UpdateVoiceSettingsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  twilio_account_sid?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  twilio_auth_token?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  twilio_phone_number?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  voice_default_profile?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  voice_routing_number?: string;
}

export class SynthesizeDto {
  @ApiProperty()
  @IsString()
  text!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  voice?: string;
}
