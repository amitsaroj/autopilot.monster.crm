import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { SchedulerRepository } from './scheduler.repository';
import { CreateScheduledJobDto, UpdateScheduledJobDto } from './dto/scheduler.dto';
import { ScheduledJob, JobStatus } from '../../database/entities/scheduled-job.entity';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly schedulerRepository: SchedulerRepository,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing scheduled jobs from database...');
    const jobs = await this.schedulerRepository.findActiveJobs();
    for (const job of jobs) {
      this.scheduleJob(job);
    }
  }

  async create(tenantId: string, dto: CreateScheduledJobDto): Promise<ScheduledJob> {
    const jobEntity = this.schedulerRepository.create({
      ...dto,
      tenantId,
      status: JobStatus.ENABLED,
    });
    const savedJob = await this.schedulerRepository.save(jobEntity);
    this.scheduleJob(savedJob);
    return savedJob;
  }

  async findAll(tenantId: string): Promise<ScheduledJob[]> {
    return this.schedulerRepository.findAll(tenantId);
  }

  async findOne(tenantId: string, id: string): Promise<ScheduledJob> {
    const job = await this.schedulerRepository.findById(id, tenantId);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(tenantId: string, id: string, dto: UpdateScheduledJobDto): Promise<ScheduledJob> {
    const job = await this.findOne(tenantId, id);
    
    // Update fields
    Object.assign(job, dto);
    const updatedJob = await this.schedulerRepository.save(job);

    // Re-schedule if enabled, otherwise stop
    this.stopJob(id);
    if (updatedJob.status === JobStatus.ENABLED) {
      this.scheduleJob(updatedJob);
    }

    return updatedJob;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    this.stopJob(id);
    await this.schedulerRepository.delete(id);
  }

  private scheduleJob(job: ScheduledJob) {
    try {
      const cronJob = new CronJob(job.cron, () => {
        this.executeJob(job);
      });

      this.schedulerRegistry.addCronJob(job.id, cronJob);
      cronJob.start();
      this.logger.log(`Job ${job.id} (${job.name}) scheduled with cron: ${job.cron}`);
    } catch (error: any) {
      this.logger.error(`Failed to schedule job ${job.id}: ${error.message}`);
    }
  }

  private stopJob(jobId: string) {
    try {
      const jobNames = Array.from(this.schedulerRegistry.getCronJobs().keys());
      if (jobNames.includes(jobId)) {
        this.schedulerRegistry.deleteCronJob(jobId);
        this.logger.log(`Job ${jobId} stopped and removed from registry`);
      }
    } catch (e) {}
  }

  private async executeJob(job: ScheduledJob) {
    this.logger.log(`Executing scheduled job: ${job.name} (ID: ${job.id})`);
    
    // Update last run
    job.lastRunAt = new Date();
    await this.schedulerRepository.save(job);

    try {
      // In a real system, you'd trigger handlers based on job.target
      // For now, we log it
      this.logger.log(`Triggering target: ${job.target} for tenant: ${job.tenantId}`);
      
      // Update success
      job.status = JobStatus.ENABLED;
      job.errorMessage = undefined;
    } catch (error: any) {
      this.logger.error(`Job ${job.id} execution failed: ${error.message}`);
      job.status = JobStatus.FAILED;
      job.errorMessage = error.message;
    }

    await this.schedulerRepository.save(job);
  }
}
