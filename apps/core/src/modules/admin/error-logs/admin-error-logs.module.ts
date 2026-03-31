import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminErrorLogsController } from './admin-error-logs.controller';
import { AdminErrorLogsService } from './admin-error-logs.service';
import { ErrorLog } from '../../../database/entities/error-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorLog])],
  controllers: [AdminErrorLogsController],
  providers: [AdminErrorLogsService],
  exports: [AdminErrorLogsService],
})
export class AdminErrorLogsModule {}
