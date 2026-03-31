import { Module } from '@nestjs/common';
import { AdminPluginsController } from './admin-plugins.controller';
import { AdminPluginsService } from './admin-plugins.service';

@Module({
  controllers: [AdminPluginsController],
  providers: [AdminPluginsService],
  exports: [AdminPluginsService],
})
export class AdminPluginsModule {}
