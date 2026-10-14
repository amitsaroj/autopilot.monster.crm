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
