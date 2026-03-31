import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminWorkflowsController } from './sub-admin-workflows.controller';
import { SubAdminWorkflowsService } from './sub-admin-workflows.service';
import { Flow } from '../../../database/entities/flow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Flow])],
  controllers: [SubAdminWorkflowsController],
  providers: [SubAdminWorkflowsService],
  exports: [SubAdminWorkflowsService],
})
export class SubAdminWorkflowsModule {}
