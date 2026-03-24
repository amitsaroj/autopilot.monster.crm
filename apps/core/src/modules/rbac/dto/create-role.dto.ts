import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Sales Manager' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Full access to CRM leads and deals' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['uuid-1', 'uuid-2'], description: 'Array of permission IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}
