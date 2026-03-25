import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminInvoicesController } from './admin-invoices.controller';
import { AdminInvoicesService } from './admin-invoices.service';
import { Invoice } from '@autopilot/core/database/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  controllers: [AdminInvoicesController],
  providers: [AdminInvoicesService],
  exports: [AdminInvoicesService],
})
export class AdminInvoicesModule {}
