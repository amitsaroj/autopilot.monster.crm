import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Max,
  Min,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListSuppressedWhatsappConsentDto extends PaginationDto {}

export class ReconsentWhatsappConsentDto {
  @IsIn(['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'])
  scope!: 'ALL' | 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  @IsString() @MinLength(3) @MaxLength(200) source!: string;
  @IsString() @MinLength(3) @MaxLength(4000) evidence!: string;
  @IsOptional() @IsBoolean() confirmGlobalOptOutOverride?: boolean;
}

export class ListWhatsappConsentDto {
  @IsOptional() @IsIn(['OPTED_IN', 'OPTED_OUT']) status?: 'OPTED_IN' | 'OPTED_OUT';
  @IsOptional() @IsIn(['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION']) scope?:
    | 'ALL'
    | 'MARKETING'
    | 'UTILITY'
    | 'AUTHENTICATION';
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) limit?: number;
}

export class RecordWhatsappConsentDto {
  @IsString() @MinLength(8) @MaxLength(30) phone!: string;
  @IsIn(['OPTED_IN', 'OPTED_OUT']) status!: 'OPTED_IN' | 'OPTED_OUT';
  @IsOptional()
  @IsIn(['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'])
  scope?: 'ALL' | 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  @IsString() @MinLength(3) @MaxLength(200) source!: string;
  @IsOptional() @IsString() @MaxLength(4000) evidence?: string;
}

export class ImportWhatsappConsentDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => RecordWhatsappConsentDto)
  records!: RecordWhatsappConsentDto[];
}

export class UpdateContactSuppressionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('4', { each: true })
  contactIds!: string[];

  @IsBoolean()
  doNotContact!: boolean;
}

export class UpdateWhatsappPreferencesDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  timezone?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  preferredLanguage?: string | null;

  @IsOptional()
  @IsBoolean()
  marketingEnabled?: boolean;
}
