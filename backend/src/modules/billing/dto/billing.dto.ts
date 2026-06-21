import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AttachPaymentMethodDto {
  @ApiProperty()
  @IsString()
  paymentMethodId!: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  setDefault?: boolean;
}

export class UpgradeSubscriptionDto {
  @ApiProperty()
  @IsString()
  planId!: string;

  @ApiProperty({ enum: ['MONTHLY', 'ANNUAL'] })
  @IsString()
  billingCycle!: 'MONTHLY' | 'ANNUAL';
}

export class DowngradeSubscriptionDto {
  @ApiProperty()
  @IsString()
  planId!: string;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  atPeriodEnd?: boolean;
}
