import { Module } from '@nestjs/common';
import { AdminBackupsController } from './admin-backups.controller';
import { AdminBackupsService } from './admin-backups.service';

@Module({
  controllers: [AdminBackupsController],
  providers: [AdminBackupsService],
  exports: [AdminBackupsService],
})
export class AdminBackupsModule {}
