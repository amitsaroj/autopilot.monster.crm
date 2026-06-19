import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

import {
  FineTuningJob,
  FineTuningStatus,
} from '../../database/entities/fine-tuning-job.entity';
import { BaseRepository } from '../../database/base.repository';
import { StorageService } from '../storage/storage.service';
import { CreateFineTuningJobDto, UpdateFineTuningJobDto } from './dto/fine-tuning.dto';

@Injectable()
export class FineTuningRepository extends BaseRepository<FineTuningJob> {
  constructor(@InjectRepository(FineTuningJob) repo: Repository<FineTuningJob>) {
    super(repo);
  }
}

@Injectable()
export class FineTuningService {
  private readonly logger = new Logger(FineTuningService.name);

  constructor(
    private readonly repository: FineTuningRepository,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(tenantId: string): Promise<FineTuningJob[]> {
    const jobs = await this.repository.findAll(tenantId, { order: { createdAt: 'DESC' } });
    return Promise.all(jobs.map((job) => this.syncJobStatus(job)));
  }

  async findOne(tenantId: string, id: string): Promise<FineTuningJob> {
    const job = await this.repository.findById(tenantId, id);
    if (!job) {
      throw new NotFoundException('Fine-tuning job not found');
    }
    return this.syncJobStatus(job);
  }

  async create(tenantId: string, dto: CreateFineTuningJobDto): Promise<FineTuningJob> {
    const job = await this.repository.create(tenantId, {
      name: dto.name,
      baseModel: dto.baseModel,
      datasetFileKey: dto.datasetFileKey,
      hyperparameters: dto.hyperparameters ?? {},
      status: FineTuningStatus.PENDING,
    });

    return this.startTraining(tenantId, job);
  }

  async update(tenantId: string, id: string, dto: UpdateFineTuningJobDto): Promise<FineTuningJob> {
    await this.findOne(tenantId, id);
    return this.repository.updateWithTenant(tenantId, id, dto);
  }

  async cancel(tenantId: string, id: string): Promise<FineTuningJob> {
    const job = await this.findOne(tenantId, id);
    if (job.status === FineTuningStatus.COMPLETED || job.status === FineTuningStatus.CANCELLED) {
      return job;
    }

    if (job.openaiJobId) {
      const client = this.getOpenAiClient();
      if (client) {
        try {
          await client.fineTuning.jobs.cancel(job.openaiJobId);
        } catch (error) {
          this.logger.warn(`Failed to cancel OpenAI job ${job.openaiJobId}`, error);
        }
      }
    }

    return this.repository.updateWithTenant(tenantId, id, {
      status: FineTuningStatus.CANCELLED,
      completedAt: new Date(),
    });
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.repository.delete(tenantId, id);
  }

  private getOpenAiClient(): OpenAI | null {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'mock-api-key' || apiKey.startsWith('sk-ci-test')) {
      return null;
    }
    return new OpenAI({ apiKey });
  }

  private async startTraining(tenantId: string, job: FineTuningJob): Promise<FineTuningJob> {
    const client = this.getOpenAiClient();
    if (!client) {
      return this.repository.updateWithTenant(tenantId, job.id, {
        status: FineTuningStatus.FAILED,
        errorMessage: 'OpenAI API key is not configured',
        completedAt: new Date(),
      });
    }

    if (!job.datasetFileKey) {
      return this.repository.updateWithTenant(tenantId, job.id, {
        status: FineTuningStatus.FAILED,
        errorMessage: 'Dataset file is required for fine-tuning',
        completedAt: new Date(),
      });
    }

    try {
      const buffer = await this.storageService.getObjectBuffer(tenantId, job.datasetFileKey);
      const uploadFile = await toFile(buffer, 'training.jsonl', { type: 'application/jsonl' });
      const uploaded = await client.files.create({
        file: uploadFile,
        purpose: 'fine-tune',
      });

      const nEpochs = job.hyperparameters.n_epochs;
      const openaiJob = await client.fineTuning.jobs.create({
        model: job.baseModel,
        training_file: uploaded.id,
        ...(typeof nEpochs === 'number' ? { hyperparameters: { n_epochs: nEpochs } } : {}),
      });

      return this.repository.updateWithTenant(tenantId, job.id, {
        status: FineTuningStatus.TRAINING,
        openaiJobId: openaiJob.id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fine-tuning start failed';
      this.logger.error(`Fine-tuning job ${job.id} failed to start`, error);
      return this.repository.updateWithTenant(tenantId, job.id, {
        status: FineTuningStatus.FAILED,
        errorMessage: message,
        completedAt: new Date(),
      });
    }
  }

  private async syncJobStatus(job: FineTuningJob): Promise<FineTuningJob> {
    if (
      !job.openaiJobId ||
      job.status === FineTuningStatus.COMPLETED ||
      job.status === FineTuningStatus.FAILED ||
      job.status === FineTuningStatus.CANCELLED
    ) {
      return job;
    }

    const client = this.getOpenAiClient();
    if (!client) {
      return job;
    }

    try {
      const openaiJob = await client.fineTuning.jobs.retrieve(job.openaiJobId);
      const status = this.mapOpenAiStatus(openaiJob.status);

      if (status === job.status && !openaiJob.fine_tuned_model) {
        return job;
      }

      return this.repository.updateWithTenant(job.tenantId, job.id, {
        status,
        fineTunedModel: openaiJob.fine_tuned_model ?? job.fineTunedModel,
        errorMessage: openaiJob.error?.message ?? job.errorMessage,
        completedAt:
          status === FineTuningStatus.COMPLETED ||
          status === FineTuningStatus.FAILED ||
          status === FineTuningStatus.CANCELLED
            ? new Date()
            : job.completedAt,
      });
    } catch (error) {
      this.logger.warn(`Failed to sync OpenAI job ${job.openaiJobId}`, error);
      return job;
    }
  }

  private mapOpenAiStatus(status: string): FineTuningStatus {
    switch (status) {
      case 'validating_files':
      case 'queued':
      case 'running':
        return FineTuningStatus.TRAINING;
      case 'succeeded':
        return FineTuningStatus.COMPLETED;
      case 'failed':
        return FineTuningStatus.FAILED;
      case 'cancelled':
        return FineTuningStatus.CANCELLED;
      default:
        this.logger.warn(`Unknown OpenAI fine-tuning status: ${status}`);
        return FineTuningStatus.TRAINING;
    }
  }
}
