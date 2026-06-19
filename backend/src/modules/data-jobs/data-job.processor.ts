import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';

import { QUEUE_NAMES } from '../../queue/queue.constants';
import { DataJobService, DataJobQueuePayload } from './data-job.service';
import { Contact } from '../../database/entities/contact.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Company } from '../../database/entities/company.entity';
import { Lead } from '../../database/entities/lead.entity';
import { StorageService } from '../../storage/storage.service';

@Processor(QUEUE_NAMES.IMPORT)
export class ImportJobProcessor {
  private readonly logger = new Logger(ImportJobProcessor.name);

  constructor(
    private readonly dataJobService: DataJobService,
    private readonly storageService: StorageService,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  @Process('process-import')
  async handleImport(job: Job<DataJobQueuePayload>): Promise<void> {
    const { jobId, tenantId, entityType, fileKey } = job.data;
    await this.dataJobService.markProcessing(jobId);

    try {
      if (!fileKey) {
        throw new Error('fileKey is required for import');
      }

      const buffer = await this.storageService.getObjectBuffer(tenantId, fileKey);
      const content = buffer.toString('utf-8');
      const rows = this.parseCsv(content);
      let imported = 0;

      for (const row of rows) {
        await this.importRow(tenantId, entityType, row);
        imported += 1;
      }

      await this.dataJobService.markCompleted(jobId, {
        metadata: { imported, entityType },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      this.logger.error(`Import job ${jobId} failed`, error);
      await this.dataJobService.markFailed(jobId, message);
    }
  }

  private parseCsv(content: string): Array<Record<string, string>> {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      return [];
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? '';
      });
      return row;
    });
  }

  private async importRow(
    tenantId: string,
    entityType: string,
    row: Record<string, string>,
  ): Promise<void> {
    switch (entityType) {
      case 'contacts':
        await this.contactRepository.save(
          this.contactRepository.create({
            tenantId,
            firstName: row.firstName ?? row.first_name ?? 'Unknown',
            lastName: row.lastName ?? row.last_name ?? '',
            email: row.email ?? `import-${Date.now()}@example.com`,
            phone: row.phone,
            tags: [],
          }),
        );
        break;
      case 'companies':
        await this.companyRepository.save(
          this.companyRepository.create({
            tenantId,
            name: row.name ?? 'Imported Company',
            domain: row.domain,
            tags: [],
          }),
        );
        break;
      case 'deals':
        await this.dealRepository.save(
          this.dealRepository.create({
            tenantId,
            name: row.name ?? 'Imported Deal',
            value: parseFloat(row.value ?? '0'),
            currency: row.currency ?? 'USD',
            pipelineId: row.pipelineId,
            stageId: row.stageId,
            tags: [],
          }),
        );
        break;
      case 'leads':
        await this.leadRepository.save(
          this.leadRepository.create({
            tenantId,
            firstName: row.firstName ?? row.first_name ?? 'Lead',
            lastName: row.lastName ?? row.last_name ?? '',
            email: row.email ?? `lead-${Date.now()}@example.com`,
            phone: row.phone ?? '0000000000',
            status: 'NEW',
          }),
        );
        break;
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }
}

@Processor(QUEUE_NAMES.EXPORT)
export class ExportJobProcessor {
  private readonly logger = new Logger(ExportJobProcessor.name);

  constructor(
    private readonly dataJobService: DataJobService,
    private readonly storageService: StorageService,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  @Process('process-export')
  async handleExport(job: Job<DataJobQueuePayload>): Promise<void> {
    await this.runExport(job.data);
  }

  @Process('process-backup')
  async handleBackup(job: Job<DataJobQueuePayload>): Promise<void> {
    await this.runBackup(job.data);
  }

  private async runExport(payload: DataJobQueuePayload): Promise<void> {
    const { jobId, tenantId, entityType, format } = payload;
    await this.dataJobService.markProcessing(jobId);

    try {
      const records = await this.fetchRecords(tenantId, entityType);
      const content =
        format === 'json'
          ? JSON.stringify(records, null, 2)
          : this.toCsv(records);

      const extension = format === 'json' ? 'json' : 'csv';
      const mimeType = format === 'json' ? 'application/json' : 'text/csv';
      const fileKey = `exports/${entityType}-${Date.now()}.${extension}`;
      const stored = await this.storageService.putObject(
        tenantId,
        fileKey,
        Buffer.from(content, 'utf-8'),
        mimeType,
      );

      await this.dataJobService.markCompleted(jobId, {
        fileKey: stored.objectKey,
        downloadUrl: stored.downloadUrl,
        metadata: { recordCount: records.length, entityType, format },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      this.logger.error(`Export job ${jobId} failed`, error);
      await this.dataJobService.markFailed(jobId, message);
    }
  }

  private async runBackup(payload: DataJobQueuePayload): Promise<void> {
    const { jobId, tenantId } = payload;
    await this.dataJobService.markProcessing(jobId);

    try {
      const [contacts, deals, companies] = await Promise.all([
        this.contactRepository.find({ where: { tenantId } }),
        this.dealRepository.find({ where: { tenantId } }),
        this.companyRepository.find({ where: { tenantId } }),
      ]);

      const backup = { contacts, deals, companies, exportedAt: new Date().toISOString() };
      const fileKey = `backups/tenant-${tenantId}-${Date.now()}.json`;
      const stored = await this.storageService.putObject(
        tenantId,
        fileKey,
        Buffer.from(JSON.stringify(backup), 'utf-8'),
        'application/json',
        true,
      );

      await this.dataJobService.markCompleted(jobId, {
        fileKey: stored.objectKey,
        downloadUrl: stored.downloadUrl,
        metadata: {
          contacts: contacts.length,
          deals: deals.length,
          companies: companies.length,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Backup failed';
      this.logger.error(`Backup job ${jobId} failed`, error);
      await this.dataJobService.markFailed(jobId, message);
    }
  }

  private async fetchRecords(
    tenantId: string,
    entityType: string,
  ): Promise<Array<Record<string, unknown>>> {
    switch (entityType) {
      case 'contacts': {
        const records = await this.contactRepository.find({ where: { tenantId } });
        return this.toPlainRecords(records);
      }
      case 'deals': {
        const records = await this.dealRepository.find({ where: { tenantId } });
        return this.toPlainRecords(records);
      }
      case 'companies': {
        const records = await this.companyRepository.find({ where: { tenantId } });
        return this.toPlainRecords(records);
      }
      case 'leads': {
        const records = await this.leadRepository.find({ where: { tenantId } });
        return this.toPlainRecords(records);
      }
      default:
        throw new Error(`Unsupported export entity: ${entityType}`);
    }
  }

  private toPlainRecords<T extends object>(records: T[]): Array<Record<string, unknown>> {
    return records.map(
      (record) => JSON.parse(JSON.stringify(record)) as Record<string, unknown>,
    );
  }

  private toCsv(records: Array<Record<string, unknown>>): string {
    if (records.length === 0) {
      return '';
    }

    const headers = Object.keys(records[0]);
    const lines = [headers.join(',')];
    for (const record of records) {
      lines.push(headers.map((header) => String(record[header] ?? '')).join(','));
    }
    return lines.join('\n');
  }
}
