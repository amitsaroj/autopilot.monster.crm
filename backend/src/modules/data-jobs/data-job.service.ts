import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';

import {
  DataJob,
  DataJobStatus,
  DataJobType,
} from '../../database/entities/data-job.entity';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { StartExportDto, StartImportDto } from './dto/data-job.dto';

export interface DataJobQueuePayload {
  jobId: string;
  tenantId: string;
  entityType: string;
  fileKey?: string;
  format?: string;
}

@Injectable()
export class DataJobService {
  constructor(
    @InjectRepository(DataJob)
    private readonly jobRepository: Repository<DataJob>,
    @InjectQueue(QUEUE_NAMES.IMPORT)
    private readonly importQueue: Queue<DataJobQueuePayload>,
    @InjectQueue(QUEUE_NAMES.EXPORT)
    private readonly exportQueue: Queue<DataJobQueuePayload>,
  ) {}

  async startImport(tenantId: string, dto: StartImportDto): Promise<DataJob> {
    const job = await this.jobRepository.save(
      this.jobRepository.create({
        tenantId,
        type: DataJobType.IMPORT,
        status: DataJobStatus.PENDING,
        entityType: dto.entityType,
        fileKey: dto.fileKey,
        metadata: { entityType: dto.entityType },
      }),
    );

    await this.importQueue.add('process-import', {
      jobId: job.id,
      tenantId,
      entityType: dto.entityType,
      fileKey: dto.fileKey,
    });

    return job;
  }

  async startExport(tenantId: string, dto: StartExportDto): Promise<DataJob> {
    const job = await this.jobRepository.save(
      this.jobRepository.create({
        tenantId,
        type: DataJobType.EXPORT,
        status: DataJobStatus.PENDING,
        entityType: dto.entityType,
        metadata: { entityType: dto.entityType, format: dto.format ?? 'csv' },
      }),
    );

    await this.exportQueue.add('process-export', {
      jobId: job.id,
      tenantId,
      entityType: dto.entityType,
      format: dto.format ?? 'csv',
    });

    return job;
  }

  async startBackup(tenantId: string): Promise<DataJob> {
    const job = await this.jobRepository.save(
      this.jobRepository.create({
        tenantId,
        type: DataJobType.BACKUP,
        status: DataJobStatus.PENDING,
        metadata: { scope: 'tenant' },
      }),
    );

    await this.exportQueue.add('process-backup', {
      jobId: job.id,
      tenantId,
      entityType: 'backup',
    });

    return job;
  }

  async getJob(tenantId: string, id: string): Promise<DataJob> {
    const job = await this.jobRepository.findOne({ where: { id, tenantId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async getHistory(tenantId: string, type: DataJobType): Promise<DataJob[]> {
    return this.jobRepository.find({
      where: { tenantId, type },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markProcessing(id: string): Promise<void> {
    await this.jobRepository.update({ id }, { status: DataJobStatus.PROCESSING });
  }

  async markCompleted(
    id: string,
    updates: Partial<Pick<DataJob, 'downloadUrl' | 'fileKey' | 'metadata'>>,
  ): Promise<void> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      return;
    }

    job.status = DataJobStatus.COMPLETED;
    job.completedAt = new Date();
    if (updates.downloadUrl !== undefined) {
      job.downloadUrl = updates.downloadUrl;
    }
    if (updates.fileKey !== undefined) {
      job.fileKey = updates.fileKey;
    }
    if (updates.metadata !== undefined) {
      job.metadata = updates.metadata;
    }

    await this.jobRepository.save(job);
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.jobRepository.update(
      { id },
      { status: DataJobStatus.FAILED, errorMessage, completedAt: new Date() },
    );
  }
}
