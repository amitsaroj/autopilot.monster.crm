import { Module } from '@nestjs/common';
import { AdminDebugController } from './admin-debug.controller';
import { AdminDebugService } from './admin-debug.service';

@Module({
  controllers: [AdminDebugController],
  providers: [AdminDebugService],
  exports: [AdminDebugService],
})
export class AdminDebugModule {}
