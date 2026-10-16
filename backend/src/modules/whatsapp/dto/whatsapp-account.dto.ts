import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ConnectWhatsappAccountDto {
  @ApiPropertyOptional({ enum: ['meta'], default: 'meta' })
  @IsOptional()
  @IsIn(['meta'])
  provider?: 'meta';

  @ApiProperty({ description: 'Meta provider phone number ID, not the display phone number' })
  @IsString()
  @Matches(/^[1-9][0-9]{0,63}$/)
  phoneNumberId!: string;

  @ApiProperty({ description: 'WhatsApp Business Account (WABA) ID' })
  @IsString()
  @Matches(/^[1-9][0-9]{0,63}$/)
  businessAccountId!: string;

  @ApiProperty({ writeOnly: true, format: 'password' })
  @IsString()
  @MinLength(1)
  @MaxLength(8192)
  @Matches(/^\S+$/)
  accessToken!: string;
}

/** Result of the Meta Embedded Signup popup: FB.login `code` + WA_EMBEDDED_SIGNUP session info. */
export class EmbeddedSignupDto {
  @ApiProperty({
    writeOnly: true,
    description: 'Single-use code from FB.login (response_type=code)',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  @Matches(/^\S+$/)
  code!: string;

  @ApiProperty({ description: 'waba_id from the WA_EMBEDDED_SIGNUP message' })
  @IsString()
  @Matches(/^[1-9][0-9]{0,63}$/)
  businessAccountId!: string;

  @ApiProperty({ description: 'phone_number_id from the WA_EMBEDDED_SIGNUP message' })
  @IsString()
  @Matches(/^[1-9][0-9]{0,63}$/)
  phoneNumberId!: string;

  @ApiPropertyOptional({
    writeOnly: true,
    description: 'Optional 6-digit two-step verification PIN; when present the phone is registered',
  })
  @IsOptional()
  @Matches(/^[0-9]{6}$/)
  pin?: string;
}
