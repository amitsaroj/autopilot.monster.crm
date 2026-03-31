import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { JobStatus } from '../../../database/entities/scheduled-job.entity';

export class CreateScheduledJobDto {
  @ApiProperty({ example: 'Email Digest', description: 'Name of the scheduled job' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Sends daily activity summary to tenant admin' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '0 9 * * *', description: 'Cron expression' })
  @IsString()
  @IsNotEmpty()
  cron!: string;

  @ApiProperty({ example: 'email:digest', description: 'Target action to trigger' })
  @IsString()
  @IsNotEmpty()
  target!: string;

  @ApiPropertyOptional({ example: { template: 'daily-summary' } })
  @IsObject()
  @IsOptional()
  payload?: any;
}

export class UpdateScheduledJobDto extends CreateScheduledJobDto {
  @ApiPropertyOptional({ enum: JobStatus })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;
}
