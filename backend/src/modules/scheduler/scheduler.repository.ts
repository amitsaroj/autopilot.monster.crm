import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ScheduledJob, JobStatus } from '../../database/entities/scheduled-job.entity';

@Injectable()
export class SchedulerRepository extends Repository<ScheduledJob> {
  constructor(dataSource: DataSource) {
    super(ScheduledJob, dataSource.createEntityManager());
  }

  async findAll(tenantId: string): Promise<ScheduledJob[]> {
    return this.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, tenantId: string): Promise<ScheduledJob | null> {
    return this.findOne({
      where: { id, tenantId },
    });
  }

  async findActiveJobs(): Promise<ScheduledJob[]> {
    return this.find({
      where: { status: JobStatus.ENABLED },
    });
  }
}
