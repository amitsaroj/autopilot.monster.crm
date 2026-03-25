import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { ContactStatus } from '../../../database/entities/contact.entity';
import { DealStatus } from '../../../database/entities/deal.entity';

export class CreateContactDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;
}

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}

export class CreateDealDto {
  @ApiProperty({ example: 'Large Enterprise Sale' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  value!: number;

  @IsUUID()
  pipelineId!: string;

  @IsUUID()
  stageId!: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;
}
