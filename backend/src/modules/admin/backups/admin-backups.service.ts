import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as Minio from 'minio';
import { StorageService } from '../../../storage/storage.service';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface BackupRecord {
  id: string;
  name: string;
  size?: string;
  createdAt: Date;
  status: string;
  errorMessage?: string;
}

interface ListedBackupObject {
  name: string;
  size?: number;
  lastModified?: Date;
}

@Injectable()
export class AdminBackupsService {
  private readonly logger = new Logger(AdminBackupsService.name);
  private currentBackups: BackupRecord[] = [];

  constructor(private readonly storageService: StorageService) {}

  async findAll() {
    const backups = [...this.currentBackups];

    try {
      const bucket = this.storageService.getBackupsBucket();
      const objects = await this.listBackupObjects(bucket);
      const knownNames = new Set(backups.map((b) => b.name));

      for (const obj of objects) {
        if (obj.name && !knownNames.has(obj.name)) {
          backups.push({
            id: obj.name,
            name: obj.name,
            size: this.formatSize(obj.size),
            createdAt: obj.lastModified ?? new Date(),
            status: 'SUCCESS',
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to list backups from storage: ${err.message}`);
    }

    return backups.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async findOne(id: string) {
    const all = await this.findAll();
    return all.find((b) => b.id === id);
  }

  async trigger() {
    const backupId = `bak-${Date.now()}`;
    const fileName = `backup-${Date.now()}.sql`;
    const tempPath = path.join('/tmp', fileName);

    const backupRecord: BackupRecord = {
      id: backupId,
      name: fileName,
      status: 'RUNNING',
      createdAt: new Date(),
    };
    this.currentBackups.push(backupRecord);

    this.runBackup(backupId, tempPath, fileName).catch((err) => {
      this.logger.error(`Backup ${backupId} failed`, err);
    });

    return backupRecord;
  }

  private async listBackupObjects(bucket: string): Promise<ListedBackupObject[]> {
    return new Promise((resolve, reject) => {
      const items: ListedBackupObject[] = [];
      const stream = this.storageService.getClient().listObjects(bucket, '', true);
      stream.on('data', (obj: Minio.BucketItem) => {
        if (obj.name) {
          items.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
          });
        }
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(items));
    });
  }

  private formatSize(bytes?: number): string {
    if (!bytes) {
      return 'Unknown';
    }
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    return (bytes / 1024).toFixed(2) + ' KB';
  }

  private async runBackup(id: string, tempPath: string, fileName: string) {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) throw new Error('DATABASE_URL not set');

      this.logger.log(`Starting DB dump to ${tempPath}`);
      await execAsync(`pg_dump ${dbUrl} -f ${tempPath}`);

      this.logger.log(`Uploading ${fileName} to storage`);
      const fileBuffer = fs.readFileSync(tempPath);
      await this.storageService
        .getClient()
        .putObject(this.storageService.getBackupsBucket(), fileName, fileBuffer);

      const stats = fs.statSync(tempPath);
      const size = (stats.size / (1024 * 1024)).toFixed(2) + ' MB';

      const record = this.currentBackups.find((b) => b.id === id);
      if (record) {
        record.status = 'SUCCESS';
        record.size = size;
      }

      fs.unlinkSync(tempPath);
      this.logger.log(`Backup ${id} completed successfully`);
    } catch (err: any) {
      const record = this.currentBackups.find((b) => b.id === id);
      if (record) {
        record.status = 'FAILED';
        record.errorMessage = err.message;
      }
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw err;
    }
  }
}
