import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RoleAssignmentDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty()
  @IsUUID()
  roleId!: string;
}
