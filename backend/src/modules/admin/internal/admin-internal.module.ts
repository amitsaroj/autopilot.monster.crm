import { Module } from '@nestjs/common';
import { AdminInternalController } from './admin-internal.controller';
import { AdminInternalService } from './admin-internal.service';

@Module({
  controllers: [AdminInternalController],
  providers: [AdminInternalService],
  exports: [AdminInternalService],
})
export class AdminInternalModule {}
