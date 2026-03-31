import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsLowercase, Matches } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'acme' })
  @IsNotEmpty()
  @IsString()
  @IsLowercase()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string;
}
