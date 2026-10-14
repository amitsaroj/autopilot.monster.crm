import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class RecordWhatsappConsentDto {
  @IsString() @MinLength(8) @MaxLength(30) phone!: string;
  @IsIn(['OPTED_IN', 'OPTED_OUT']) status!: 'OPTED_IN' | 'OPTED_OUT';
  @IsOptional()
  @IsIn(['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'])
  scope?: 'ALL' | 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  @IsString() @MinLength(3) @MaxLength(200) source!: string;
  @IsOptional() @IsString() @MaxLength(4000) evidence?: string;
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
