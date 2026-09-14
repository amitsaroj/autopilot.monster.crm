import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FineTuningJob, FineTuningStatus } from '../../database/entities/fine-tuning-job.entity';
import { BaseRepository } from '../../database/base.repository';
import { StorageService } from '../../storage/storage.service';
import { CreateFineTuningJobDto, UpdateFineTuningJobDto } from './dto/fine-tuning.dto';
import { AiProviderService } from './providers/ai-provider.service';
import type { AiFineTuningJobStatus } from './providers/ai-provider.interface';

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
    private readonly aiProviderService: AiProviderService,
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
      const provider = this.aiProviderService.getFineTuningProvider();
      if (provider) {
        try {
          await provider.cancelJob(job.openaiJobId);
        } catch (error) {
          this.logger.warn(`Failed to cancel fine-tuning job ${job.openaiJobId}`, error);
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

  private async startTraining(tenantId: string, job: FineTuningJob): Promise<FineTuningJob> {
    const provider = this.aiProviderService.getFineTuningProvider();
    if (!provider) {
      return this.repository.updateWithTenant(tenantId, job.id, {
        status: FineTuningStatus.FAILED,
        errorMessage: 'AI provider is not configured',
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
      const { fileId } = await provider.uploadTrainingFile(buffer, 'training.jsonl');

      const nEpochs = job.hyperparameters.n_epochs;
      const { providerJobId } = await provider.createJob({
        baseModel: job.baseModel,
        trainingFileId: fileId,
        nEpochs: typeof nEpochs === 'number' ? nEpochs : undefined,
      });

      return this.repository.updateWithTenant(tenantId, job.id, {
        status: FineTuningStatus.TRAINING,
        openaiJobId: providerJobId,
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

    const provider = this.aiProviderService.getFineTuningProvider();
    if (!provider) {
      return job;
    }

    try {
      const providerStatus = await provider.retrieveJob(job.openaiJobId);
      const status = mapAiFineTuningStatus(providerStatus.status);

      if (status === job.status && !providerStatus.fineTunedModel) {
        return job;
      }

      return this.repository.updateWithTenant(job.tenantId, job.id, {
        status,
        fineTunedModel: providerStatus.fineTunedModel ?? job.fineTunedModel,
        errorMessage: providerStatus.errorMessage ?? job.errorMessage,
        completedAt:
          status === FineTuningStatus.COMPLETED ||
          status === FineTuningStatus.FAILED ||
          status === FineTuningStatus.CANCELLED
            ? new Date()
            : job.completedAt,
      });
    } catch (error) {
      this.logger.warn(`Failed to sync fine-tuning job ${job.openaiJobId}`, error);
      return job;
    }
  }
}

function mapAiFineTuningStatus(status: AiFineTuningJobStatus['status']): FineTuningStatus {
  switch (status) {
    case 'running':
      return FineTuningStatus.TRAINING;
    case 'succeeded':
      return FineTuningStatus.COMPLETED;
    case 'failed':
      return FineTuningStatus.FAILED;
    case 'cancelled':
      return FineTuningStatus.CANCELLED;
    default:
      return FineTuningStatus.TRAINING;
  }
}
