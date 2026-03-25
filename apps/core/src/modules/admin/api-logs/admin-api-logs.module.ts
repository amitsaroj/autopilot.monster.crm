import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminApiLogsController } from './admin-api-logs.controller';
import { AdminApiLogsService } from './admin-api-logs.service';
import { ApiLog } from '@autopilot/core/database/entities/api-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiLog])],
  controllers: [AdminApiLogsController],
  providers: [AdminApiLogsService],
  exports: [AdminApiLogsService],
})
export class AdminApiLogsModule {}
