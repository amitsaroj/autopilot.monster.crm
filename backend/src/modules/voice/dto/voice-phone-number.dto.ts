import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class ProvisionPhoneNumberDto {
  @ApiProperty({ example: '+14155551234' })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  country!: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  capabilities?: { voice: boolean; sms: boolean; mms: boolean };
}
