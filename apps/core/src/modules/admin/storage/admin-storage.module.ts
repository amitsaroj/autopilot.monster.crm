import { Module } from '@nestjs/common';
import { AdminStorageController } from './admin-storage.controller';
import { AdminStorageService } from './admin-storage.service';

@Module({
  controllers: [AdminStorageController],
  providers: [AdminStorageService],
  exports: [AdminStorageService],
})
export class AdminStorageModule {}
