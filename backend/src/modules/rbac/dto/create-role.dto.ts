import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateRoleDto {
  @ApiProperty({ example: 'Sales Manager' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional({ example: 'Full access to CRM leads and deals' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ example: ['uuid-1', 'uuid-2'], description: 'Array of permission IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}

export class RoleFilterDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'Sales' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class PermissionFilterDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'crm' })
  @IsString()
  @IsOptional()
  search?: string;
}
