import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { DataJob } from '../../database/entities/data-job.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Company } from '../../database/entities/company.entity';
import { Lead } from '../../database/entities/lead.entity';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { DataJobService } from './data-job.service';
import { ImportJobProcessor, ExportJobProcessor } from './data-job.processor';
import { ImportController } from './import.controller';
import { ExportController } from './export.controller';
import { BackupController } from './backup.controller';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataJob, Contact, Deal, Company, Lead]),
    BullModule.registerQueue({ name: QUEUE_NAMES.IMPORT }, { name: QUEUE_NAMES.EXPORT }),
    StorageModule,
  ],
  controllers: [ImportController, ExportController, BackupController],
  providers: [DataJobService, ImportJobProcessor, ExportJobProcessor],
  exports: [DataJobService],
})
export class DataJobsModule {}
