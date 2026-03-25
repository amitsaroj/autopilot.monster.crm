import { Module } from '@nestjs/common';
import { AdminRestoreController } from './admin-restore.controller';
import { AdminRestoreService } from './admin-restore.service';

@Module({
  controllers: [AdminRestoreController],
  providers: [AdminRestoreService],
  exports: [AdminRestoreService],
})
export class AdminRestoreModule {}
