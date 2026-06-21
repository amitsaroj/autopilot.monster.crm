import { Module } from '@nestjs/common';
import { AdminRestoreController } from './admin-restore.controller';
import { AdminRestoreService } from './admin-restore.service';
import { AdminBackupsModule } from '../backups/admin-backups.module';
import { StorageModule } from '../../../storage/storage.module';

@Module({
  imports: [AdminBackupsModule, StorageModule],
  controllers: [AdminRestoreController],
  providers: [AdminRestoreService],
  exports: [AdminRestoreService],
})
export class AdminRestoreModule {}
