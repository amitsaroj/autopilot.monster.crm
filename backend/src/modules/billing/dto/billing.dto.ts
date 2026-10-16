import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

const BILLING_CYCLES = ['MONTHLY', 'ANNUAL'] as const;
const PLAN_STATUSES = ['ACTIVE', 'ARCHIVED'] as const;
const LIMIT_PERIODS = ['DAILY', 'MONTHLY', 'TOTAL'] as const;

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

  @ApiProperty({ enum: BILLING_CYCLES })
  @IsIn(BILLING_CYCLES)
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

// --- Plan management (SuperAdmin) ---

export class CreatePlanDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  slug!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  priceMonthly!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  priceAnnual!: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsString()
  @Length(3, 3)
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ enum: PLAN_STATUSES })
  @IsIn(PLAN_STATUSES)
  @IsOptional()
  status?: 'ACTIVE' | 'ARCHIVED';

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  stripePriceIdMonthly?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  stripePriceIdAnnual?: string;
}

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}

export class CreatePlanFeatureDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  featureKey!: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;
}

export class UpdatePlanFeatureDto extends PartialType(CreatePlanFeatureDto) {}

export class CreatePlanLimitDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  metric!: string;

  @ApiProperty({ description: '-1 for unlimited' })
  @IsInt()
  @Min(-1)
  value!: number;

  @ApiPropertyOptional({ enum: LIMIT_PERIODS })
  @IsIn(LIMIT_PERIODS)
  @IsOptional()
  period?: 'DAILY' | 'MONTHLY' | 'TOTAL';
}

export class UpdatePlanLimitDto extends PartialType(CreatePlanLimitDto) {}
