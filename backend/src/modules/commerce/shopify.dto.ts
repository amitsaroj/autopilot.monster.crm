import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

export class ConnectShopifyDto {
  @ApiProperty({ example: 'example-store.myshopify.com' })
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)
  shop!: string;
}
