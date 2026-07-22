import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';

export enum OmnichannelPreferredChannel {
  VOICE = 'VOICE',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  WEBCHAT = 'WEBCHAT',
}

export class SendOmnichannelMessageDto {
  @ApiProperty()
  @IsUUID()
  contactId!: string;

  @ApiProperty()
  @IsString()
  text!: string;

  @ApiProperty({ enum: OmnichannelPreferredChannel })
  @IsEnum(OmnichannelPreferredChannel)
  preferredChannel!: OmnichannelPreferredChannel;
}
