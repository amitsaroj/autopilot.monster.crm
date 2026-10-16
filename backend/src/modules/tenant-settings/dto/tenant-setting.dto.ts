import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertTenantSettingDto {
  @ApiProperty({ example: 'stripe.publishableKey' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key!: string;

  @ApiProperty({ description: 'Any JSON value' })
  @IsDefined()
  value!: unknown;

  @ApiPropertyOptional({ example: 'INTEGRATION' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  group?: string;
}
